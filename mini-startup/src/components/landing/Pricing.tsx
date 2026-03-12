import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import LogoLoop from '@/components/LogoLoop'

export default function Pricing() {
  const pricing = [
    {
      name: "Стартовый",
      price: "0",
      description: "Идеально для независимых специалистов",
      features: ["До 50 записей/мес", "Профили клиентов", "Мобильное приложение", "Базовая аналитика"]
    },
    {
      name: "Профессиональный",
      price: "300",
      description: "Лучший для растущих салонов и студий",
      features: ["Неограниченные записи", "Управление персоналом", "Автоматические SMS напоминания", "Расширенная отчетность", "Кастомный брендинг"],
      popular: true
    },
    {
      name: "Бизнес",
      price: "650",
      description: "Для предприятий с несколькими филиалами",
      features: ["Поддержка нескольких локаций", "Учет товаров", "Интеграция с зарплатой", "API доступ", "Приоритетная поддержка"]
    }
  ]

  return (
    <section id="pricing" className="py-32 bg-background">
      <div className="container mx-auto px-6 text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Простая и прозрачная цена</h2>
        <p className="text-muted-foreground text-lg">Без скрытых платежей. Выберите план, который подходит для вашего роста.</p>
      </div>
      
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
        {pricing.map((plan, i) => (
          <Card
            key={plan.name}
            className={cn(
              "p-8 flex flex-col transition-all duration-300 backdrop-blur-2xl bg-card/30 border border-border/40",
              plan.popular 
                ? "border-primary/40 bg-primary/5 backdrop-blur-2xl scale-105 shadow-2xl shadow-primary/20" 
                : "hover:border-primary/30 shadow-lg hover:shadow-xl"
            )}
          >
            {plan.popular && (
              <span className="backdrop-blur-xl bg-accent/80 text-accent-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full self-start mb-4 border border-accent/30">
                Самый популярный
              </span>
            )}
            <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
            <p className="text-sm mb-8 text-muted-foreground">
              {plan.description}
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-display font-bold">{plan.price} MDL</span>
              <span className="text-sm opacity-70">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-1 text-left">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 shrink-0 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              variant={plan.popular ? "default" : "outline"} 
              className="w-full rounded-full h-12 font-bold backdrop-blur-xl bg-background/40 border border-border/50 hover:bg-background/60"
            >
              Выбрать {plan.name}
            </Button>
          </Card>
        ))}
      </div>
      
      {/* Бегущая строка с логотипами технологий */}
      <div className="mt-32 py-16 border-t border-border/50 overflow-hidden">
        <div className="container mx-auto px-6 text-center mb-12">
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Вот такие технологии мы используем при создании наших сервисов
          </p>
        </div>
        <div className="w-full">
          <LogoLoop
            logos={[
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
                alt: "React",
                href: "https://react.dev",
                title: "React",
                width: 48,
                height: 48
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                alt: "TypeScript",
                href: "https://www.typescriptlang.org",
                title: "TypeScript",
                width: 48,
                height: 48
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
                alt: "Supabase",
                href: "https://supabase.com",
                title: "Supabase",
                width: 48,
                height: 48
              },
              {
                node: (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="brightness-0 invert opacity-80">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
                  </svg>
                ),
                href: "https://github.com",
                title: "GitHub",
                ariaLabel: "Visit GitHub website"
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
                alt: "Docker",
                href: "https://www.docker.com",
                title: "Docker",
                width: 48,
                height: 48
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
                alt: "Vercel",
                href: "https://vercel.com",
                title: "Vercel",
                width: 48,
                height: 48
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
                alt: "Tailwind CSS",
                href: "https://tailwindcss.com",
                title: "Tailwind CSS",
                width: 48,
                height: 48
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
                alt: "Next.js",
                href: "https://nextjs.org",
                title: "Next.js",
                width: 48,
                height: 48
              },
            ]}
            speed={60}
            direction="left"
            logoHeight={48}
            gap={80}
            pauseOnHover={true}
            fadeOut={false}
            scaleOnHover={true}
            className="py-8"
          />
        </div>
      </div>
    </section>
  )
}
