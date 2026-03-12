import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Particles from '@/components/landing/Particles'
import { ArrowLeft, Eye, EyeOff, Upload, ChevronDown } from 'lucide-react'

interface BusinessType {
  id: string
  name: string
  subcategories: string[]
}

const businessTypes: BusinessType[] = [
  {
    id: 'beauty',
    name: 'Салоны красоты',
    subcategories: ['Парикмахерская/Барбершоп', 'Маникюр', 'Косметология'],
  },
  {
    id: 'massage',
    name: 'Массажный салон',
    subcategories: [],
  },
  {
    id: 'auto',
    name: 'Автосервисы / Мастерские',
    subcategories: ['Диагностика', 'Ремонт', 'Шиномонтаж', 'ТО'],
  },
  {
    id: 'medical',
    name: 'Медицинские клиники (частные)',
    subcategories: ['Стоматология'],
  },
  {
    id: 'specialists',
    name: 'Частные специалисты',
    subcategories: ['Психологи', 'Терапевты', 'Коучи', 'Юристы'],
  },
  {
    id: 'fitness',
    name: 'Фитнес и спорт',
    subcategories: [
      'Персональные тренеры',
      'Студии йоги',
      'Танцевальные школы',
      'Пилатес',
    ],
  },
  {
    id: 'education',
    name: 'Образование',
    subcategories: ['Репетиторы', 'Языковые школы', 'Курсы', 'Автошколы'],
  },
  {
    id: 'hotel',
    name: 'Гостиницы / Хостелы',
    subcategories: [],
  },
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    logo: null as File | null,
    businessType: '',
    subcategories: [] as string[],
    fullName: '',
    businessName: '',
    country: '',
    phone: '',
    address: '',
    slug: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  const countries = ['Молдова', 'Румыния', 'Приднестровье']

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      // TODO: Подключить Supabase позже
      console.log('Register data:', formData)
      
      // Сохраняем данные в localStorage для использования в админке
      localStorage.setItem('userEmail', formData.email)
      localStorage.setItem('fullName', formData.fullName)
      localStorage.setItem('businessName', formData.businessName)
      
      // Симуляция задержки
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const toggleSubcategory = (sub: string) => {
    const current = formData.subcategories
    if (current.includes(sub)) {
      setFormData({ ...formData, subcategories: current.filter(s => s !== sub) })
    } else {
      setFormData({ ...formData, subcategories: [...current, sub] })
    }
  }

  const selectedType = businessTypes.find(t => t.id === formData.businessType)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Particles Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Particles 
          particleColors={['#ffffff', '#ffffff']} 
          particleCount={150} 
          particleSpread={10} 
          speed={0.1} 
          particleBaseSize={80} 
          moveParticlesOnHover={true} 
          alphaParticles={true} 
          disableRotation={false} 
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Домой</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Создайте аккаунт
          </p>
        </div>

        {/* Glass Form Card */}
        <div className="backdrop-blur-2xl bg-card/30 border border-border/50 rounded-2xl shadow-2xl shadow-black/20 p-8 md:p-10">
          {/* Шаг 1: Email и пароль */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext() }} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Пароль
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50 pr-12"
                    placeholder="Минимум 6 символов"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50 pr-12"
                    placeholder="Повторите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">Пароли не совпадают</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={formData.password !== formData.confirmPassword || !formData.email}
                size="lg"
                className="w-full h-12 rounded-full backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30 disabled:opacity-50"
              >
                Далее
              </Button>
            </form>
          )}

          {/* Шаг 2: Логотип */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  Загрузите логотип
                </h2>
                <p className="text-sm text-muted-foreground">
                  Вы сможете изменить его позже в настройках персонализации
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFormData({ ...formData, logo: file })
                }}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {formData.logo ? (
                  <>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent/30 bg-card/40 backdrop-blur-sm flex items-center justify-center mb-4">
                      <img
                        src={URL.createObjectURL(formData.logo)}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{formData.logo.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData({ ...formData, logo: null })
                      }}
                      className="text-sm text-accent hover:text-accent/80 transition-colors"
                    >
                      Изменить
                    </button>
                  </>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-border/50 bg-card/40 backdrop-blur-sm flex items-center justify-center mb-4 hover:border-accent/50 transition">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Нажмите для загрузки</p>
                    </div>
                  </div>
                )}
              </label>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-full"
                >
                  Назад
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  size="lg"
                  className="flex-1 h-12 rounded-full backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30"
                >
                  Далее
                </Button>
              </div>
            </div>
          )}

          {/* Шаг 3: Тип бизнеса */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-display font-bold text-foreground mb-1">
                  Выберите тип бизнеса
                </h2>
                <p className="text-sm text-muted-foreground">Кто вы?</p>
              </div>

              {!formData.businessType ? (
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, businessType: type.id, subcategories: [] })}
                      className="w-full p-3 text-left backdrop-blur-sm bg-card/40 border border-border/50 rounded-lg hover:border-accent/50 hover:bg-card/50 transition"
                    >
                      <div className="font-semibold text-foreground text-sm">{type.name}</div>
                    </button>
                  ))}
                </div>
              ) : selectedType && selectedType.subcategories.length > 0 ? (
                <div>
                  <button
                    onClick={() => setFormData({ ...formData, businessType: '', subcategories: [] })}
                    className="mb-3 text-accent hover:text-accent/80 transition-colors text-sm"
                  >
                    ← Назад к выбору
                  </button>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{selectedType.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Выберите один или несколько вариантов:</p>
                  <div className="space-y-2 max-h-[calc(100vh-450px)] overflow-y-auto scrollbar-hide">
                    {selectedType.subcategories.map((sub) => {
                      const isSelected = formData.subcategories.includes(sub)
                      return (
                        <label
                          key={sub}
                          className={`group flex items-center p-3 backdrop-blur-sm border rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-accent/60 bg-accent/10 shadow-lg shadow-accent/10'
                              : 'border-border/50 bg-card/40 hover:border-accent/40 hover:bg-card/50'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSubcategory(sub)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-accent border-accent shadow-md shadow-accent/30'
                                : 'bg-card/60 border-border/60 group-hover:border-accent/50'
                            }`}>
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className={`ml-3 font-medium text-sm transition-colors ${
                            isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                          }`}>
                            {sub}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setFormData({ ...formData, businessType: '' })}
                    className="mb-3 text-accent hover:text-accent/80 transition-colors text-sm"
                  >
                    ← Назад к выбору
                  </button>
                  <div className="p-3 backdrop-blur-sm bg-card/50 border border-accent/50 rounded-lg">
                    <div className="font-semibold text-foreground text-sm">{selectedType?.name}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-full"
                >
                  Назад
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.businessType || (selectedType?.subcategories.length > 0 && formData.subcategories.length === 0)}
                  size="lg"
                  className="flex-1 h-12 rounded-full backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30 disabled:opacity-50"
                >
                  Далее
                </Button>
              </div>
            </div>
          )}

          {/* Шаг 4: Информация о бизнесе */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  Заполните информацию о бизнесе
                </h2>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Полное имя *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                  placeholder="Например: Иван Иванов"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Название бизнеса *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                  placeholder="Например: Салон Красоты Мария"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Страна *
                </label>
                <div ref={countryDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className={`w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between ${
                      isCountryOpen
                        ? 'border-accent/50 ring-2 ring-accent/30'
                        : 'border-border/50 hover:border-accent/30'
                    } ${formData.country ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    <span>{formData.country || 'Выберите страну'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isCountryOpen && (
                    <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                      <div className="py-1">
                        {countries.map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, country })
                              setIsCountryOpen(false)
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                              formData.country === country
                                ? 'bg-accent/20 text-accent'
                                : 'text-foreground hover:bg-accent/10 hover:text-accent'
                            }`}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Телефон *
                </label>
                <Input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                  placeholder="+373 123 456 789"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Адрес *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                  placeholder="Город, улица, дом"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  URL страницы *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">yoursite.com/b/</span>
                  <Input
                    type="text"
                    required
                    pattern="[a-z0-9-]+"
                    value={formData.slug || generateSlug(formData.businessName)}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                    placeholder="salon-maria"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Только латинские буквы, цифры и дефисы
                </p>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-full"
                >
                  Назад
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.fullName.trim() ||
                    !formData.businessName.trim() ||
                    !formData.country ||
                    !formData.phone.trim() ||
                    !formData.address.trim() ||
                    !formData.slug.trim()
                  }
                  size="lg"
                  className="flex-1 h-12 rounded-full backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30 disabled:opacity-50"
                >
                  {loading ? 'Создание...' : 'Создать аккаунт'}
                </Button>
              </div>
            </form>
          )}

          {/* Login Link */}
          {step === 1 && (
            <div className="mt-8 text-center pt-6 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <Link
                  to="/login"
                  className="text-accent hover:text-accent/80 font-semibold transition-colors"
                >
                  Войти
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
