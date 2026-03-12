import { useState, useRef, useEffect } from 'react'
import { Plus, MoreVertical, Edit, Trash2, X, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface Service {
  id: string
  category: string
  name: string
  duration: number
  price: number
  active: boolean
}

const initialServices: Service[] = [
  { id: '1', category: 'Парикмахерская/Барбершоп', name: 'Мужская стрижка', duration: 45, price: 350, active: true },
  { id: '2', category: 'Парикмахерская/Барбершоп', name: 'Стрижка бороды', duration: 30, price: 250, active: true },
  { id: '3', category: 'Маникюр', name: 'Классический маникюр', duration: 60, price: 400, active: true },
  { id: '4', category: 'Косметология', name: 'Чистка лица', duration: 90, price: 800, active: false },
]

const categories = ['Парикмахерская/Барбершоп', 'Маникюр', 'Косметология']

// Функция для загрузки услуг из localStorage
const loadServices = (): Service[] => {
  const stored = localStorage.getItem('services')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Ошибка загрузки услуг:', e)
    }
  }
  // Если нет сохраненных услуг, сохраняем начальные
  localStorage.setItem('services', JSON.stringify(initialServices))
  return initialServices
}

// Функция для сохранения услуг в localStorage
const saveServices = (services: Service[]) => {
  localStorage.setItem('services', JSON.stringify(services))
}

export default function Services() {
  const { t } = useLanguage()
  const [services, setServices] = useState<Service[]>(loadServices)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    duration: '',
    price: '',
    active: true,
  })
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }
      // Закрываем меню при клике вне его
      if (showMenu) {
        const menuRef = menuRefs.current[showMenu]
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setShowMenu(null)
        }
      }
    }
    // Используем небольшую задержку, чтобы onClick на кнопках успел сработать
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category) {
      alert(t('services.selectCategoryRequired'))
      return
    }
    if (!formData.name) {
      alert(t('services.fillName'))
      return
    }
    if (!formData.duration) {
      alert(t('services.fillDuration'))
      return
    }

    let updatedServices: Service[]
    if (editingService) {
      // Редактирование существующей услуги
      updatedServices = services.map(service => 
        service.id === editingService.id
          ? {
              ...service,
              category: formData.category,
              name: formData.name,
              duration: parseInt(formData.duration),
              price: parseFloat(formData.price) || 0,
              active: formData.active,
            }
          : service
      )
      setEditingService(null)
    } else {
      // Добавление новой услуги
      const newService: Service = {
        id: Date.now().toString(),
        category: formData.category,
        name: formData.name,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price) || 0,
        active: formData.active,
      }
      updatedServices = [...services, newService]
    }
    
    setServices(updatedServices)
    saveServices(updatedServices)

    // Сброс формы
    setFormData({
      category: '',
      name: '',
      duration: '',
      price: '',
      active: true,
    })
    setShowForm(false)
    setShowMenu(null)
  }

  const handleEdit = (service: Service, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingService(service)
    setFormData({
      category: service.category,
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString(),
      active: service.active,
    })
    setShowMenu(null)
  }

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (confirm(t('services.confirmDelete'))) {
      const updatedServices = services.filter(service => service.id !== id)
      setServices(updatedServices)
      saveServices(updatedServices)
      setShowMenu(null)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingService(null)
    setFormData({
      category: '',
      name: '',
      duration: '',
      price: '',
      active: true,
    })
  }

  const toggleActive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const updatedServices = services.map(service =>
      service.id === id ? { ...service, active: !service.active } : service
    )
    setServices(updatedServices)
    saveServices(updatedServices)
    setShowMenu(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Button 
          className="rounded-full bg-primary hover:bg-primary/90"
          onClick={() => {
            setShowForm(true)
            setEditingService(null)
            setFormData({
              category: '',
              name: '',
              duration: '',
              price: '',
              active: true,
            })
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> {t('services.addService')}
        </Button>
      </div>

      {/* Форма добавления новой услуги */}
      {showForm && !editingService && (
        <Card 
          className="p-6 backdrop-blur-xl bg-card/60 border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">{t('services.addService')}</h3>
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
              {/* Категория */}
              <div ref={categoryDropdownRef} className="relative">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('services.category')} *
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
                  <span>{formData.category || t('services.selectCategory')}</span>
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

              {/* Название */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('services.serviceName')} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('services.serviceName')}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              {/* Длительность */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('services.duration')} *
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  min="1"
                  required
                />
              </div>

              {/* Цена */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('services.price')}
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="200"
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Активность */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  formData.active ? "bg-accent" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    formData.active ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <label className="text-sm text-foreground cursor-pointer" onClick={() => setFormData({ ...formData, active: !formData.active })}>
                {formData.active ? t('common.active') : t('common.inactive')}
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="rounded-full">
                <Check className="w-4 h-4 mr-2" />
                {t('services.addService')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="rounded-full">
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Модальное окно редактирования */}
      {editingService && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => {
              setEditingService(null)
              handleCancel()
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card 
              className="w-full max-w-md backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">{t('services.editService')}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingService(null)
                      handleCancel()
                    }}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    {/* Категория */}
                    <div ref={categoryDropdownRef} className="relative">
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {t('services.category')} *
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
                        <span>{formData.category || t('services.selectCategory')}</span>
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

                    {/* Название */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {t('services.serviceName')} *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('services.serviceName')}
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                        required
                      />
                    </div>

                    {/* Длительность */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {t('services.duration')} *
                      </label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="30"
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                        min="1"
                        required
                      />
                    </div>

                    {/* Цена */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        {t('services.price')}
                      </label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="200"
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Активность */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, active: !formData.active })}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          formData.active ? "bg-accent" : "bg-muted"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            formData.active ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                      <label className="text-sm text-foreground cursor-pointer" onClick={() => setFormData({ ...formData, active: !formData.active })}>
                        {formData.active ? t('common.active') : t('common.inactive')}
                      </label>
                    </div>
                  </div>

                  {/* Кнопки */}
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="rounded-full flex-1">
                      <Check className="w-4 h-4 mr-2" />
                      {t('common.save')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingService(null)
                        handleCancel()
                      }} 
                      className="rounded-full"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Список услуг */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <Card 
            key={service.id} 
            className={cn(
              "p-5 backdrop-blur-xl bg-card/60 border-border/50 transition-all hover:bg-card/80 relative",
              showMenu === service.id && "z-[9999]",
              !service.active && "opacity-70"
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-foreground truncate">{service.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{service.category}</p>
                <p className="text-sm text-muted-foreground">{service.duration} мин</p>
              </div>
              
              <div className="relative z-[9999]">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(showMenu === service.id ? null : service.id)
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                
                {showMenu === service.id && (
                  <div 
                    ref={(el) => { menuRefs.current[service.id] = el }}
                    className="absolute right-0 top-10 z-[9999] min-w-[160px] backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(service, e)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        {t('services.editService')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleActive(service.id, e)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        {service.active ? t('services.disableService') : t('services.enableService')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(service.id, e)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('services.deleteService')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <p className="font-display font-bold text-xl text-foreground">
                {service.price > 0 ? `${service.price} MDL` : t('common.free')}
              </p>
              <Badge 
                className={cn(
                  "text-xs font-medium border",
                  service.active 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                )}
              >
                {service.active ? t('common.active') : t('common.inactive')}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="p-12 text-center backdrop-blur-xl bg-card/60">
          <p className="text-muted-foreground">{t('services.noServices')}</p>
        </Card>
      )}
    </div>
  )
}
