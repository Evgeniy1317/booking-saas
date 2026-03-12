export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Регистрация',
      description: 'Создайте аккаунт за 2 минуты. Введите название бизнеса, выберите тип и загрузите логотип.',
    },
    {
      number: '02',
      title: 'Настройка',
      description: 'Добавьте услуги, мастеров и рабочие часы. Персонализируйте страницу цветами и текстом.',
    },
    {
      number: '03',
      title: 'Публикация',
      description: 'Получите уникальную ссылку на вашу страницу записи. Разместите её в соцсетях и на сайте.',
    },
    {
      number: '04',
      title: 'Готово!',
      description: 'Клиенты записываются сами, вы получаете уведомления, всё работает автоматически.',
    },
  ]

  return (
    <section id="how-it-works" className="py-32 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Как это работает
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Начните за 5 минут. Никаких сложных настроек.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="relative backdrop-blur-2xl bg-card/25 border border-border/40 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                <div className="text-6xl font-display font-bold text-primary/10 mb-4 group-hover:text-primary/20 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
                {/* Декоративный элемент */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full group-hover:bg-primary/40 transition-colors" />
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-border/30 transform translate-x-4 z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50 border-2 border-background" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
