import { useState, useRef, useEffect } from 'react'
import { Download, MoreVertical, Edit, Trash2, Search, Phone, Mail, History, Plus, Lock, X, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, matchesSearchQuery } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

// Функция для проверки подписки Plus
const hasPlusSubscription = (): boolean => {
  const subscription = localStorage.getItem('subscription')
  if (subscription) {
    try {
      const sub = JSON.parse(subscription)
      return sub.plan === 'plus' || sub.plan === 'professional' || sub.plan === 'business'
    } catch (e) {
      console.error('Ошибка проверки подписки:', e)
    }
  }
  return false
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  bookings: number
  lastVisit: string
  spent: number
  status: 'active' | 'inactive'
}

// Функция для загрузки клиентов из записей
const loadCustomersFromAppointments = (): Customer[] => {
  const stored = localStorage.getItem('appointments')
  if (!stored) return []
  
  try {
    const appointments = JSON.parse(stored)
    const filtered = appointments.filter((apt: any) => apt.status !== 'cancelled')
    
    // Группируем записи по клиентам (по телефону, так как это уникальный идентификатор)
    const customersMap = new Map<string, {
      name: string
      phone: string
      email?: string
      appointments: any[]
    }>()
    
    filtered.forEach((apt: any) => {
      const phone = apt.phone || ''
      if (!phone) return
      
      if (!customersMap.has(phone)) {
        customersMap.set(phone, {
          name: apt.client || '',
          phone: phone,
          email: apt.email,
          appointments: []
        })
      }
      
      const customer = customersMap.get(phone)!
      customer.appointments.push(apt)
      // Обновляем имя и email, если они есть
      if (apt.client && apt.client !== customer.name) {
        customer.name = apt.client
      }
      if (apt.email && !customer.email) {
        customer.email = apt.email
      }
    })
    
    // Преобразуем в массив клиентов с вычисленной статистикой
    const today = new Date()
    const customers: Customer[] = Array.from(customersMap.values()).map((customerData, index) => {
      const appointments = customerData.appointments
      const bookings = appointments.length
      
      // Вычисляем потраченную сумму
      const spent = appointments.reduce((total: number, apt: any) => {
        const price = apt.price || 0
        return total + price
      }, 0)
      
      // Находим последний визит
      let lastVisit = t('customers.never')
      let lastAppointment: Date | null = null
      
      if (appointments.length > 0) {
        const sortedAppointments = [...appointments].sort((a: any, b: any) => {
          const dateA = new Date(a.date || 0)
          const dateB = new Date(b.date || 0)
          return dateB.getTime() - dateA.getTime()
        })
        
        lastAppointment = new Date(sortedAppointments[0].date)
        const diffTime = today.getTime() - lastAppointment.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) {
          lastVisit = t('customers.today')
        } else if (diffDays === 1) {
          lastVisit = t('customers.yesterday')
        } else if (diffDays < 7) {
          lastVisit = `${diffDays} ${t('customers.daysAgo')}`
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7)
          lastVisit = weeks === 1 ? t('customers.weekAgo') : `${weeks} ${t('customers.weeksAgo')}`
        } else {
          const months = Math.floor(diffDays / 30)
          lastVisit = months === 1 ? t('customers.monthAgo') : `${months} ${t('customers.monthsAgo')}`
        }
      }
      
      // Определяем статус (активен, если была запись за последние 90 дней)
      const isActive = lastAppointment 
        ? (today.getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24) < 90
        : false
      
      return {
        id: `customer-${index + 1}`,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        bookings,
        lastVisit,
        spent,
        status: isActive ? 'active' : 'inactive'
      }
    })
    
    // Сортируем по последнему визиту (самые свежие первые)
    return customers.sort((a, b) => {
      const aCustomer = customersMap.get(a.phone)
      const bCustomer = customersMap.get(b.phone)
      if (!aCustomer || !bCustomer) return 0
      
      const aLastDate = aCustomer.appointments.length > 0
        ? new Date([...aCustomer.appointments].sort((a: any, b: any) => 
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
          )[0].date)
        : new Date(0)
      const bLastDate = bCustomer.appointments.length > 0
        ? new Date([...bCustomer.appointments].sort((a: any, b: any) => 
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
          )[0].date)
        : new Date(0)
      
      return bLastDate.getTime() - aLastDate.getTime()
    })
  } catch (e) {
    console.error('Ошибка загрузки клиентов:', e)
    return []
  }
}

export default function Customers() {
  const { t, language } = useLanguage()
  const [customers, setCustomers] = useState<Customer[]>(loadCustomersFromAppointments())
  const [searchQuery, setSearchQuery] = useState('')
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const [hasPlus, setHasPlus] = useState<boolean>(hasPlusSubscription())
  const [showClientHistory, setShowClientHistory] = useState(false)
  const [historyClient, setHistoryClient] = useState<{ name: string; phone: string } | null>(null)
  
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})
  
  const statusConfig = {
    pending: { label: t('status.pending'), color: 'bg-amber-500/40 text-amber-300 border-amber-500/50' },
    confirmed: { label: t('status.confirmed'), color: 'bg-emerald-500/40 text-emerald-300 border-emerald-500/50' },
    'no-show': { label: t('status.noShow'), color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    completed: { label: t('status.completed'), color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  }
  
  // Функция для получения истории записей клиента
  const getClientHistory = (clientPhone: string) => {
    const stored = localStorage.getItem('appointments')
    if (!stored) return []
    
    try {
      const appointments = JSON.parse(stored)
      // Фильтруем записи по телефону клиента
      const clientAppointments = appointments
        .filter((apt: any) => apt.phone === clientPhone && apt.status !== 'cancelled')
        .map((apt: any) => ({
          date: apt.date || '',
          service: apt.service || '',
          master: apt.master || apt.staff || '',
          amount: apt.price || 0,
          status: apt.status || 'pending',
          startTime: apt.startTime || apt.time || '',
          endTime: apt.endTime || '',
        }))
        .sort((a: any, b: any) => {
          // Сортируем по дате (новые первые)
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      
      return clientAppointments
    } catch (e) {
      console.error('Ошибка загрузки истории клиента:', e)
      return []
    }
  }
  
  const handleShowHistory = (customer: Customer) => {
    setHistoryClient({ name: customer.name, phone: customer.phone })
    setShowClientHistory(true)
    setShowMenu(null)
    setMenuPosition(null)
  }
  
  // Обновляем клиентов при изменении записей
  useEffect(() => {
    const updateCustomers = () => {
      setCustomers(loadCustomersFromAppointments())
    }
    updateCustomers()
    window.addEventListener('storage', updateCustomers)
    const interval = setInterval(updateCustomers, 1000)
    return () => {
      window.removeEventListener('storage', updateCustomers)
      clearInterval(interval)
    }
  }, [])
  
  // Обновляем статус подписки
  useEffect(() => {
    const updateSubscription = () => {
      setHasPlus(hasPlusSubscription())
    }
    updateSubscription()
    window.addEventListener('storage', updateSubscription)
    const interval = setInterval(updateSubscription, 1000)
    return () => {
      window.removeEventListener('storage', updateSubscription)
      clearInterval(interval)
    }
  }, [])

  const getFilteredCustomers = () => {
    if (!searchQuery) return customers
    
    return customers.filter(customer => {
      // Поиск по имени и телефону
      if (matchesSearchQuery({ name: customer.name, phone: customer.phone }, searchQuery)) {
        return true
      }
      // Поиск по email
      if (customer.email?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true
      }
      return false
    })
  }

  const handleExport = () => {
    // Создаем CSV файл с данными клиентов
    const headers = [t('common.name'), t('common.phone'), t('common.email'), t('customers.bookings'), t('customers.spent'), t('customers.lastVisit'), t('common.status')]
    const rows = customers.map(customer => [
      customer.name,
      customer.phone,
      customer.email || '',
      customer.bookings.toString(),
      customer.spent.toString(),
      customer.lastVisit,
      customer.status === 'active' ? t('common.active') : t('common.inactive')
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Создаем BOM для правильного отображения кириллицы в Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${t('customers.title')}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredCustomers = getFilteredCustomers()

  return (
    <div className="space-y-6">
      {/* Поиск и кнопки */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pl-4 relative">
        <div className="flex gap-2 self-end sm:self-auto order-first sm:order-none">
          {hasPlus ? (
            <Button 
              variant="outline" 
              className="rounded-full h-8 px-3 text-xs"
              onClick={handleExport}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {t('customers.export')}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="rounded-full opacity-50 cursor-not-allowed relative group h-8 px-3 text-xs"
              disabled
              title={t('customers.exportAvailableInPlus')}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {t('customers.export')}
              <Badge 
                variant="outline" 
                className="ml-2 text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-primary/30"
              >
                <Plus className="w-3 h-3 mr-1" />
                Plus
              </Badge>
            </Button>
          )}
        </div>
        <div className="relative flex-1 w-full sm:max-w-md order-last sm:order-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
          <Input
            placeholder={t('customers.searchPlaceholder')}
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
            className="pl-10 bg-card/40 backdrop-blur-sm border-border/50"
          />
        </div>
      </div>

      {/* Список клиентов */}
      <div className="space-y-3 pl-4">
        {filteredCustomers.length === 0 ? (
          <Card className="p-12 text-center backdrop-blur-xl bg-card/60">
            <p className="text-muted-foreground">
              {searchQuery ? t('customers.customersNotFound') : t('customers.noCustomers')}
            </p>
          </Card>
        ) : (
          filteredCustomers.map(customer => (
            <Card 
              key={customer.id} 
              className="p-6 sm:p-5 min-h-[140px] backdrop-blur-xl bg-card/60 border-border/50 transition-all hover:bg-card/80"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Инициал */}
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg flex-shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  
                  {/* Информация о клиенте */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground break-words">{customer.name}</h3>
                      <Badge 
                        className={cn(
                          "text-xs font-medium border",
                          customer.status === 'active'
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        )}
                      >
                        {customer.status === 'active' ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="break-words">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="break-words sm:truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 flex-shrink-0 w-full sm:w-auto">
                    <div className="text-left sm:text-center min-w-[90px]">
                      <p className="text-xs text-muted-foreground mb-1">{t('customers.bookings')}</p>
                      <p className="font-bold text-foreground">{customer.bookings}</p>
                    </div>
                    <div className="text-left sm:text-center min-w-[90px]">
                      <p className="text-xs text-muted-foreground mb-1">{t('customers.spent')}</p>
                      <p className="font-bold text-foreground">{customer.spent} MDL</p>
                    </div>
                    <div className="text-left sm:text-center min-w-[110px]">
                      <p className="text-xs text-muted-foreground mb-1">{t('customers.lastVisit')}</p>
                      <p className="font-medium text-foreground text-sm break-words">{customer.lastVisit}</p>
                    </div>
                  </div>
                </div>

                {/* Меню действий */}
                <div className="relative ml-4" ref={(el) => { menuRefs.current[customer.id] = el }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => {
                      const button = e.currentTarget
                      const rect = button.getBoundingClientRect()
                      setMenuPosition({
                        top: rect.bottom + 2,
                        right: window.innerWidth - rect.right
                      })
                      setShowMenu(showMenu === customer.id ? null : customer.id)
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Выпадающее меню (рендерится вне карточек для правильного z-index) */}
      {showMenu && menuPosition && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setShowMenu(null)
              setMenuPosition(null)
            }}
          />
          <div 
            className="fixed z-[9999] min-w-[180px] backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`
            }}
          >
            <div className="py-1">
              {(() => {
                const customer = customers.find(c => c.id === showMenu)
                if (!customer) return null
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleShowHistory(customer)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                    >
                      <History className="w-4 h-4" />
                      {t('customers.history')}
                    </button>
                  </>
                )
              })()}
            </div>
          </div>
        </>
      )}

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
              <h3 className="text-xl font-bold mb-6 pr-12">{t('customers.visitHistory')}: {historyClient.name}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
              {getClientHistory(historyClient.phone).length > 0 ? (
                <div className="space-y-4">
                  {getClientHistory(historyClient.phone).map((visit, idx) => (
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
                            {visit.startTime && visit.endTime && (
                              <span className="text-sm text-muted-foreground">
                                {visit.startTime} - {visit.endTime}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('customers.service')}:</span>
                              <span className="text-sm font-medium text-foreground">{visit.service}</span>
                            </div>
                            {visit.master && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('customers.master')}:</span>
                                <span className="text-sm font-medium text-foreground">{visit.master}</span>
                              </div>
                            )}
                            {visit.amount > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('customers.payment')}:</span>
                                <span className="text-sm font-bold text-emerald-400">{visit.amount} MDL</span>
                              </div>
                            )}
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
                  <p className="text-muted-foreground">{t('customers.emptyHistory')}</p>
                </div>
              )}
            </div>
            
            {getClientHistory(historyClient.phone).length > 0 && (
              <div className="p-6 border-t border-border/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('customers.totalVisits')}</p>
                      <span className="text-base font-bold text-foreground">{getClientHistory(historyClient.phone).length}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('customers.totalSpent')}</p>
                      <span className="text-base font-bold text-emerald-400">
                        {getClientHistory(historyClient.phone).reduce((sum, visit) => sum + (visit.amount || 0), 0)} MDL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
