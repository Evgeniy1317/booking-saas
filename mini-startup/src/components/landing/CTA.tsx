import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Galaxy from '@/components/Galaxy'

export default function CTA() {
  return (
    <section className="py-24 container mx-auto px-6">
      <div className="rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl max-w-4xl mx-auto">
        {/* Galaxy фон */}
        <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
          <Galaxy />
        </div>
        
        {/* Контент поверх Galaxy */}
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-foreground">
            Готовы изменить свой бизнес?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6">
            Упростите управление, автоматизируйте процессы и сосредоточьтесь на росте
          </p>
          <Button size="lg" className="rounded-full backdrop-blur-xl bg-background/60 border border-border/50 hover:bg-background/70 text-foreground h-12 px-8 text-base font-semibold shadow-lg" asChild>
            <Link to="/register">
              Начать бесплатно
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
