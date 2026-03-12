import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar, Clock, Scissors, UserCheck, Users, Bell, Settings, BarChart3, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const demoSteps = [
  {
    title: 'Выберите тип бизнеса',
    description: 'Салон красоты, барбершоп, массажный салон и другие',
    content: (
      <div className="p-4 space-y-3 bg-white">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold mb-1">Кто вы?</h3>
          <p className="text-xs text-gray-500">Выберите категорию</p>
        </div>
        <div className="space-y-2">
          {['Салон красоты', 'Барбершоп', 'Массажный салон', 'Косметология'].map((item, i) => (
            <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <span className="text-xs">{item}</span>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: 'Загрузите логотип',
    description: 'Добавьте логотип вашего бизнеса',
    content: (
      <div className="p-4 space-y-3 bg-white">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold mb-1">Логотип</h3>
          <p className="text-xs text-gray-500">Загрузите изображение</p>
        </div>
        <div className="flex items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">📷</span>
            </div>
            <p className="text-xs text-gray-500">Нажмите для загрузки</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Название и контакты',
    description: 'Введите название бизнеса и контактную информацию',
    content: (
      <div className="p-4 space-y-3 bg-white">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold mb-1">Информация о бизнесе</h3>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Название бизнеса</label>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs">Luxe Beauty Salon</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Телефон</label>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs">+373 123 456 789</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Адрес</label>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs">Кишинёв, ул. Примерная, 123</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Готово!',
    description: 'Ваш салон готов принимать записи',
    content: (
      <div className="p-4 space-y-3 bg-white">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-1">Готово!</h3>
          <p className="text-xs text-gray-500">Ваш салон готов принимать записи</p>
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium mb-1">Ваша ссылка:</p>
            <p className="text-xs text-primary">salonsync.app/b/luxe-beauty</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium mb-1">QR-код готов</p>
            <p className="text-xs text-gray-500">Поделитесь с клиентами</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Админка',
    description: 'Управляйте своим бизнесом',
    content: (
      <div className="p-4 space-y-3 bg-white h-full">
        <div className="mb-3">
          <h3 className="text-lg font-bold mb-1">Панель управления</h3>
          <p className="text-xs text-gray-500">Управляйте записями и клиентами</p>
        </div>
        <div className="space-y-1.5">
          {[
            { icon: Calendar, name: 'Главная', active: false },
            { icon: Clock, name: 'Календарь', active: false },
            { icon: Clock, name: 'Записи', active: false },
            { icon: Scissors, name: 'Услуги', active: false },
            { icon: UserCheck, name: 'Мастера', active: false },
            { icon: Users, name: 'Клиенты', active: false },
            { icon: Bell, name: 'Уведомления', active: false },
            { icon: Settings, name: 'Настройки', active: false },
            { icon: BarChart3, name: 'Аналитика', active: false },
            { icon: Eye, name: 'Посмотреть флоу', active: true, highlight: true },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className={cn(
                  "p-2.5 rounded-lg flex items-center gap-2.5 text-xs",
                  item.highlight
                    ? "bg-primary/20 border-2 border-primary shadow-lg"
                    : item.active
                    ? "bg-gray-100 border border-gray-300"
                    : "bg-gray-50 border border-gray-200"
                )}
              >
                <Icon className={cn("w-4 h-4", item.highlight ? "text-primary" : "text-gray-600")} />
                <span className={cn("font-medium", item.highlight ? "text-primary font-bold" : "text-gray-700")}>
                  {item.name}
                </span>
                {item.highlight && (
                  <span className="ml-auto text-xs text-primary font-bold">→</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
  {
    title: 'Публичная страница',
    description: 'Как видят ваш сайт клиенты',
    content: (
      <div className="p-4 space-y-3 bg-white h-full">
        <div className="mb-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl">💇</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Luxe Beauty Salon</h3>
          <p className="text-xs text-gray-500">Запишитесь онлайн</p>
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Стрижка и укладка</span>
              <span className="text-xs font-bold text-primary">350 MDL</span>
            </div>
            <p className="text-xs text-gray-500">45 минут</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Окрашивание</span>
              <span className="text-xs font-bold text-primary">850 MDL</span>
            </div>
            <p className="text-xs text-gray-500">120 минут</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Маникюр</span>
              <span className="text-xs font-bold text-primary">250 MDL</span>
            </div>
            <p className="text-xs text-gray-500">60 минут</p>
          </div>
        </div>
        <button className="w-full p-3 bg-primary text-white rounded-lg text-xs font-bold mt-2">
          Записаться
        </button>
      </div>
    )
  }
]

function PhoneCarousel() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length)
    }, 8000) // Увеличено до 8 секунд
    return () => clearInterval(interval)
  }, [])

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % demoSteps.length)
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + demoSteps.length) % demoSteps.length)
  }

  return (
    <div className="relative w-full z-10" style={{ width: '100%', maxWidth: '280px', margin: '0 auto', display: 'block' }}>
      {/* iPhone Frame */}
      <div className="relative bg-[#1a1a1a] rounded-[2rem] p-1 shadow-2xl z-10 border-2 border-primary/50" style={{ width: '100%', display: 'block' }}>
        {/* Dynamic Island - смещен ниже */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
        
        {/* Screen */}
        <div className="bg-white rounded-[1.75rem] overflow-hidden relative" style={{ minHeight: '500px' }}>
          {/* Status Bar - пустой, только для отступа */}
          <div className="h-10 bg-white" />

          {/* Content */}
          <div className="relative overflow-hidden" style={{ height: '420px' }}>
            <div 
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentStep * 100}%)` }}
            >
              {demoSteps.map((step, index) => (
                <div key={index} className="min-w-full h-full flex-shrink-0 overflow-y-auto">
                  {step.content}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {demoSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === currentStep ? "bg-primary w-6" : "bg-gray-300 w-1.5"
                )}
              />
            ))}
          </div>

          {/* Navigation Arrows - перемещены вниз */}
          <button
            onClick={prevStep}
            className="absolute left-2 bottom-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 flex items-center justify-center hover:bg-white shadow-lg z-10"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={nextStep}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 flex items-center justify-center hover:bg-white shadow-lg z-10"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-400/30 rounded-full" />
      </div>
    </div>
  )
}

export default PhoneCarousel
