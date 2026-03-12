import { Smartphone, Zap, Shield } from 'lucide-react'
import PhoneCarousel from './iPhoneCarousel'

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-6">
      <div className="w-12 h-12 rounded-2xl backdrop-blur-xl bg-card/30 border border-border/40 shadow-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold mb-2">{title}</h4>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" className="py-32 bg-card/10 backdrop-blur-sm scroll-mt-20 relative z-10">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
              Всё что нужно <br />
              <span className="text-primary/40">в одном месте.</span>
            </h2>
            <div className="space-y-10">
              <FeatureItem 
                icon={<Smartphone className="w-5 h-5" />}
                title="Мобильная запись"
                desc="Удобный процесс записи для ваших клиентов, оптимизированный для любого устройства."
              />
              <FeatureItem 
                icon={<Zap className="w-5 h-5" />}
                title="Автоматические напоминания"
                desc="Снизьте количество неявок на 40% с помощью умных SMS и WhatsApp уведомлений."
              />
              <FeatureItem 
                icon={<Shield className="w-5 h-5" />}
                title="Безопасные платежи"
                desc="Принимайте предоплаты и полные платежи напрямую через платформу."
              />
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-center w-full" style={{ minHeight: '550px', position: 'relative' }}>
            <div className="w-full max-w-[280px] relative">
              <PhoneCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
