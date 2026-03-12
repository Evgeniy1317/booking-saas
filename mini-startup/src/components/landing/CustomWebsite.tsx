import { Button } from '@/components/ui/button'
import { Globe, Code, Palette, Zap } from 'lucide-react'

export default function CustomWebsite() {
  return (
    <section className="py-24 container mx-auto px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
            Нужен сайт для вашего бизнеса?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Наша команда создаёт современные сайты для бизнеса на любую тематику. 
            От интернет-магазинов до корпоративных порталов — мы реализуем ваши идеи.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-card/30 border border-border/50 rounded-2xl p-6 hover:bg-card/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Любая тематика</h3>
            <p className="text-muted-foreground text-sm">
              Создаём сайты для любых сфер бизнеса: от салонов красоты до IT-компаний
            </p>
          </div>

          <div className="backdrop-blur-xl bg-card/30 border border-border/50 rounded-2xl p-6 hover:bg-card/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Современные технологии</h3>
            <p className="text-muted-foreground text-sm">
              Используем актуальные фреймворки и инструменты для быстрой и надёжной работы
            </p>
          </div>

          <div className="backdrop-blur-xl bg-card/30 border border-border/50 rounded-2xl p-6 hover:bg-card/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Уникальный дизайн</h3>
            <p className="text-muted-foreground text-sm">
              Разрабатываем индивидуальный дизайн, который отражает стиль вашего бренда
            </p>
          </div>

          <div className="backdrop-blur-xl bg-card/30 border border-border/50 rounded-2xl p-6 hover:bg-card/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Быстрая разработка</h3>
            <p className="text-muted-foreground text-sm">
              Оптимизируем процесс разработки для быстрого запуска вашего проекта
            </p>
          </div>
        </div>

        <div className="text-center">
          <a href="#contact" className="inline-block">
            <Button size="lg" className="rounded-full backdrop-blur-xl bg-accent/80 border border-accent/30 hover:bg-accent text-accent-foreground h-12 px-8 text-base font-semibold shadow-lg">
              Заказать сайт
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}

