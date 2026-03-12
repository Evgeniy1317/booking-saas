import MetallicIcon from '@/components/ui/metallic-icon'

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/20 backdrop-blur-2xl border-b border-border/30 shadow-lg shadow-black/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-end gap-0">
          <MetallicIcon letter="B" size={48} className="shadow-lg" />
          <span className="-ml-2 font-sans font-semibold text-2xl tracking-[0.08em] leading-none text-foreground/90 -translate-y-[9px]">
            ookera
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Возможности</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Цены</a>
          <a href="#about" className="hover:text-foreground transition-colors">О нас</a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Войти
          </a>
          <a
            href="/register"
            className="px-6 py-2 backdrop-blur-xl bg-accent/80 text-accent-foreground hover:bg-accent/90 rounded-full h-11 font-medium shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30"
          >
            Зарегистрироваться
          </a>
        </div>
      </div>
    </header>
  )
}

