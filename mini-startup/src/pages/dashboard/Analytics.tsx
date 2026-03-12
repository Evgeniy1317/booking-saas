import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Plus, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Analytics() {
  const { t } = useLanguage()
  const [showContactModal, setShowContactModal] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Badge 
          variant="outline" 
          className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('analytics.availableInProfessional')}
        </Badge>
      </div>

      <Card className="p-12 text-center backdrop-blur-xl bg-card/60 border-border/50">
        <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-bold mb-2 text-foreground">{t('analytics.title')}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {t('analytics.description')}
        </p>
        <Button
          className="rounded-full bg-primary hover:bg-primary/90"
          onClick={() => setShowContactModal(true)}
        >
          {t('analytics.learnMore')}
        </Button>
      </Card>

      {/* Примеры того, что будет доступно */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-50 pointer-events-none">
        <Card className="p-6 backdrop-blur-xl bg-card/60 border-border/50">
          <div className="text-2xl font-bold mb-1 text-foreground">—</div>
          <div className="text-muted-foreground text-sm">{t('analytics.totalAppointments')}</div>
        </Card>
        <Card className="p-6 backdrop-blur-xl bg-card/60 border-border/50">
          <div className="text-2xl font-bold mb-1 text-foreground">— MDL</div>
          <div className="text-muted-foreground text-sm">{t('analytics.revenue')}</div>
        </Card>
        <Card className="p-6 backdrop-blur-xl bg-card/60 border-border/50">
          <div className="text-2xl font-bold mb-1 text-foreground">—</div>
          <div className="text-muted-foreground text-sm">{t('analytics.customers')}</div>
        </Card>
        <Card className="p-6 backdrop-blur-xl bg-card/60 border-border/50">
          <div className="text-2xl font-bold mb-1 text-foreground">—%</div>
          <div className="text-muted-foreground text-sm">{t('analytics.load')}</div>
        </Card>
      </div>

      <Card className="p-6 backdrop-blur-xl bg-card/60 border-border/50 opacity-50 pointer-events-none">
        <h3 className="text-lg font-bold mb-4 text-foreground">{t('analytics.popularServices')}</h3>
        <div className="text-center py-8 text-muted-foreground">
          {t('analytics.noData')}
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-xl bg-card/60 border-border/50 opacity-50 pointer-events-none">
        <h3 className="text-lg font-bold mb-4 text-foreground">{t('analytics.staffLoad')}</h3>
        <div className="text-center py-8 text-muted-foreground">
          {t('analytics.noData')}
        </div>
      </Card>

      {showContactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Card
            className="w-full max-w-sm backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 text-left space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{t('analytics.businessPackageTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('analytics.businessPackageDescription')}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <Button asChild variant="outline" className="w-full justify-between">
                  <a href="https://t.me/qweqweqweeqwe" target="_blank" rel="noreferrer">
                    <span>{t('analytics.contactTelegram')}</span>
                    <span className="font-semibold">@qweqweqweeqwe</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <a href="https://instagram.com/jenyaa_u" target="_blank" rel="noreferrer">
                    <span>{t('analytics.contactInstagram')}</span>
                    <span className="font-semibold">jenyaa_u</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <a href="tel:+37368851307">
                    <span>{t('analytics.contactPhone')}</span>
                    <span className="font-semibold">+37368851307</span>
                  </a>
                </Button>
              </div>
              <Button className="w-full rounded-full" onClick={() => setShowContactModal(false)}>
                {t('common.close')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
