import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative pt-40 pb-32 md:pt-56 md:pb-48 overflow-hidden min-h-screen flex items-center">
      {/* Content - поверх частиц */}
      <div className="container mx-auto px-6 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-12 h-[1px] bg-primary/30" />
            <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] shadow-yellow-400/50">
              Elevate your craft
            </span>
            <span className="w-12 h-[1px] bg-primary/30" />
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold leading-[1] tracking-tighter text-foreground mb-8">
            The New Standard <br />
            <span className="text-muted-foreground italic font-light">for Modern Business</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Упростите планирование, автоматизируйте напоминания и сосредоточьтесь на том, что умеете лучше всего — создании красоты. К нам присоединились более 2000 профессионалов по всему миру.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-10 py-4 backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground rounded-full shadow-2xl shadow-accent/20 text-lg font-semibold w-full sm:w-auto border border-accent/30"
            >
              Начните 14-дневный пробный период
            </Link>
            <a
              href="#features"
              className="px-8 py-4 backdrop-blur-xl bg-background/30 border border-border/50 rounded-full hover:bg-background/40 text-lg font-semibold w-full sm:w-auto"
            >
              Посмотреть демо
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

