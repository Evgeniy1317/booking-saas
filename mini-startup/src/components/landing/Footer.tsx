export default function Footer() {
  return (
    <footer className="backdrop-blur-2xl bg-card/20 border-t border-border/30 text-foreground py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold font-display shadow-lg">
                S
              </div>
              <span className="font-display font-bold text-xl">SalonSync</span>
            </div>
            <p className="text-foreground/70 text-sm">
              Всё-в-одном платформа для современных салонов и барбершопов.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Продукт</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><a href="#features" className="hover:text-foreground transition">Возможности</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition">Цены</a></li>
              <li><a href="#demo" className="hover:text-foreground transition">Демо</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><a href="#about" className="hover:text-foreground transition">О нас</a></li>
              <li><a href="#contact" className="hover:text-foreground transition">Контакты</a></li>
              <li><a href="#blog" className="hover:text-foreground transition">Блог</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><a href="#help" className="hover:text-foreground transition">Помощь</a></li>
              <li><a href="#faq" className="hover:text-foreground transition">FAQ</a></li>
              <li><a href="#privacy" className="hover:text-foreground transition">Конфиденциальность</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-foreground/60 text-sm">
            © 2024 SalonSync. Все права защищены.
          </p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-foreground/60 hover:text-foreground transition text-sm">
              Twitter
            </a>
            <a href="#" className="text-foreground/60 hover:text-foreground transition text-sm">
              Facebook
            </a>
            <a href="#" className="text-foreground/60 hover:text-foreground transition text-sm">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
