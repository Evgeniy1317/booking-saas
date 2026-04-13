import type { Dispatch, SetStateAction } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ServiceItem, StaffMember } from '@/components/public/PublicBookingFormSection'

export interface PublicBookingMobileBarProps {
  t: (key: string) => string
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  isMobileSummaryOpen: boolean
  setIsMobileSummaryOpen: Dispatch<SetStateAction<boolean>>
  canProceed: (step: number) => boolean
  handleSubmit: () => void
  selectedService: ServiceItem | null
  selectedStaff: StaffMember | null
  formatDisplayDate: (date: string) => string
  selectedDate: string
  selectedTime: string | null
  clientPhone: string
  clientSocialMethod: string
  clientSocialHandle: string
}

export function PublicBookingMobileBar({
  t,
  currentStep,
  setCurrentStep,
  isMobileSummaryOpen,
  setIsMobileSummaryOpen,
  canProceed,
  handleSubmit,
  selectedService,
  selectedStaff,
  formatDisplayDate,
  selectedDate,
  selectedTime,
  clientPhone,
  clientSocialMethod,
  clientSocialHandle,
}: PublicBookingMobileBarProps) {
  const inner = (
    <>
      {isMobileSummaryOpen && (
        <div className="border-b border-border/50 bg-background">
          <div className="w-full px-4 pt-4 pb-3">
            <div className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-border/50"
              >
                <span className="font-semibold text-foreground">{t('yourBooking')}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="px-4 py-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('serviceLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {selectedService?.name || t('notSelected')}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('masterLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {selectedStaff?.name || t('notSelected')}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('dateTimeLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {formatDisplayDate(selectedDate)} {selectedTime || ''}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('phonePlaceholder')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {clientPhone || t('notSelected')}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('socialNetworkLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {clientSocialMethod || '—'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('contactHandlePlaceholder')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {clientSocialHandle || '—'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">{t('priceLabel')}</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedService ? `${selectedService.price} MDL` : '—'}
                  </span>
                </div>
                <Button
                  className="w-full mt-4 rounded-full"
                  onClick={handleSubmit}
                  disabled={!canProceed(4)}
                >
                  {t('sendRequest')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full px-4 py-3 min-h-[68px] flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen((prev) => !prev)}
          className={cn(
            'flex-1 h-11 rounded-full px-4 text-sm font-semibold text-white border border-white/25',
            'bg-gradient-to-r from-slate-900/85 via-slate-800/80 to-slate-700/85',
            'backdrop-blur-xl',
            'transition hover:brightness-105 active:scale-[0.99]'
          )}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {t('viewBooking')}
            <ChevronUp className={cn('h-4 w-4 transition-transform', isMobileSummaryOpen && 'rotate-180')} />
          </span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            >
              {t('back')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              if (currentStep < 4) {
                setCurrentStep((prev) => Math.min(4, prev + 1))
              } else {
                setIsMobileSummaryOpen(true)
              }
            }}
            disabled={!canProceed(currentStep)}
          >
            {t('next')}
          </Button>
        </div>
      </div>
    </>
  )

  /** Всегда fixed к вьюпорту: на /booking рендерим в дереве + скролл страницы; на главной — через createPortal в body. */
  return (
    <div
      className="border-t border-border/50 bg-background/95 overflow-hidden"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        width: '100vw',
        maxWidth: '100vw',
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
      {inner}
    </div>
  )
}
