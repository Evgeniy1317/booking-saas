import { RefObject } from 'react'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface ServiceItem {
  id: string
  name: string
  duration: number
  price: number
  active?: boolean
}

export interface StaffMember {
  id: string
  name: string
  category: string
  color: string
  description?: string
  workingHours: { start: string; end: string }
}

export interface SummaryItem {
  label: string
  value: string
  filled: boolean
}

export interface PublicBookingFormSectionProps {
  t: (key: string) => string
  steps: string[]
  currentStep: number
  setCurrentStep: (updater: (prev: number) => number) => void
  activeServices: ServiceItem[]
  selectedServiceId: string | null
  setSelectedServiceId: (id: string | null) => void
  setSelectedStaffId: (id: string | null) => void
  setSelectedTime: (time: string | null) => void
  selectedStaffId: string | null
  selectedTime: string | null
  availableStaff: StaffMember[]
  slots: string[]
  busySlots: Set<string>
  setCalendarDate: (date: Date) => void
  setIsDatePickerOpen: (open: boolean) => void
  selectedDate: string
  formatDisplayDate: (date: string) => string
  setSelectedDate: (date: string) => void
  clientName: string
  setClientName: (v: string) => void
  clientPhone: string
  setClientPhone: (v: string) => void
  clientEmail: string
  setClientEmail: (v: string) => void
  clientComment: string
  setClientComment: (v: string) => void
  clientSocialMethod: string
  setClientSocialMethod: (v: string) => void
  isSocialOpen: boolean
  setIsSocialOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  socialOptions: string[]
  clientSocialHandle: string
  setClientSocialHandle: (v: string) => void
  canProceed: (step: number) => boolean
  handleSubmit: () => void
  summaryItems: SummaryItem[]
  selectedService: ServiceItem | null
  isMobile: boolean
  socialRef: RefObject<HTMLDivElement | null>
  /** Компактный режим для модалки — форма помещается в рамку без прокрутки */
  compact?: boolean
}

export function PublicBookingFormSection({
  t,
  steps,
  currentStep,
  setCurrentStep,
  activeServices,
  selectedServiceId,
  setSelectedServiceId,
  setSelectedStaffId,
  setSelectedTime,
  selectedStaffId,
  selectedTime,
  availableStaff,
  slots,
  busySlots,
  setCalendarDate,
  setIsDatePickerOpen,
  selectedDate,
  formatDisplayDate,
  setSelectedDate,
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  clientComment,
  setClientComment,
  clientSocialMethod,
  setClientSocialMethod,
  isSocialOpen,
  setIsSocialOpen,
  socialOptions,
  clientSocialHandle,
  setClientSocialHandle,
  canProceed,
  handleSubmit,
  summaryItems,
  selectedService,
  isMobile,
  socialRef,
  compact = false,
}: PublicBookingFormSectionProps) {
  return (
    <section className={cn('w-full max-w-6xl mx-auto', compact && 'h-full min-h-0 flex flex-col')}>
      <div className={cn(
        'grid grid-cols-1 lg:grid-cols-3 items-start lg:items-stretch overflow-hidden',
        compact ? 'gap-2 p-3 h-full min-h-0' : 'gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 overflow-visible'
      )}>
        <Card className={cn(
          'relative z-30 lg:col-span-2 h-full bg-background/40 border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] min-h-0 flex flex-col',
          compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
        )}>
          <h3 className={cn('font-display font-semibold text-center', compact ? 'text-base mb-0.5' : 'text-xl sm:text-2xl mb-2')}>{t('onlineBooking')}</h3>
          <p className={cn('text-muted-foreground text-center', compact ? 'text-[10px] sm:text-xs mb-2' : 'text-xs sm:text-sm mb-5 sm:mb-6')}>
            {t('onlineBookingSubtitle')}
          </p>

          <div className={cn('rounded-xl border border-border/50 bg-card/30 text-left shrink-0', compact ? 'mb-2 px-2 py-1.5' : 'mb-6 px-4 py-3')}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('step')} {currentStep} {t('of')} {steps.length}</span>
              <span>{steps[currentStep - 1]}</span>
            </div>
            <div className={cn('w-full rounded-full bg-muted/50', compact ? 'mt-1 h-1' : 'mt-2 h-1.5')}>
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className={cn(compact ? 'space-y-2 min-h-0 flex-1 overflow-hidden' : 'space-y-8')}>
            <div className={cn('text-center', currentStep !== 1 && 'hidden', compact && 'py-0')}>
              <div className={cn('flex items-center justify-center gap-2', compact ? 'mb-1 gap-1.5' : 'sm:gap-3 mb-2')}>
                <span className={cn('inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/15 font-bold text-primary', compact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 sm:h-7 sm:w-7 text-[10px] sm:text-xs')}>
                  1
                </span>
                <h3 className={cn('font-display font-semibold', compact ? 'text-sm' : 'text-base sm:text-lg')}>{t('serviceTitle')}</h3>
              </div>
              <p className={cn('font-medium text-foreground/80 text-left', compact ? 'text-[10px] sm:text-xs mb-1.5' : 'text-xs sm:text-sm mb-3 sm:mb-4')}>{t('chooseService')}</p>
              <div className={cn('grid grid-cols-1 md:grid-cols-2 auto-rows-fr', compact ? 'gap-1.5' : 'gap-3')}>
                {activeServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setSelectedServiceId(service.id)
                      setSelectedStaffId(null)
                      setSelectedTime(null)
                    }}
                    className={cn(
                      'w-full text-left rounded-xl border transition flex items-stretch focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0',
                      compact ? 'min-h-[36px] sm:min-h-[40px]' : 'min-h-[48px] sm:min-h-[56px]',
                      selectedServiceId === service.id
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border/60 hover:border-primary/40'
                    )}
                  >
                    <div className={cn('flex-1 flex flex-col justify-center', compact ? 'px-2 py-1.5 sm:px-3 sm:py-2' : 'px-3 py-3 sm:px-4 sm:py-4')}>
                      <h4 className={cn('font-semibold', compact && 'text-xs sm:text-sm')}>{service.name}</h4>
                      <p className={cn('text-muted-foreground', compact ? 'text-[10px] mt-0.5' : 'text-[11px] sm:text-xs mt-2')}>{service.duration} {t('minutesShort')}</p>
                    </div>
                    <div className={cn('border-l-2 border-dashed border-border/80 flex items-center', compact ? 'px-2 py-1.5 sm:px-3' : 'px-3 py-3 sm:px-4 sm:py-4')}>
                      <span className={cn('font-semibold text-emerald-400', compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm')}>
                        {service.price} MDL
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={cn('text-center', currentStep !== 2 && 'hidden', compact && 'py-0')}>
              <div className={cn('flex items-center justify-center gap-2', compact ? 'mb-1 gap-1.5' : 'sm:gap-3 mb-2')}>
                <span className={cn('inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/15 font-bold text-primary', compact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 sm:h-7 sm:w-7 text-[10px] sm:text-xs')}>
                  2
                </span>
                <h3 className={cn('font-display font-semibold', compact ? 'text-sm' : 'text-base sm:text-lg')}>{t('masterTitle')}</h3>
              </div>
              <p className={cn('font-medium text-foreground/80 text-left', compact ? 'text-[10px] sm:text-xs mb-1.5' : 'text-xs sm:text-sm mb-3 sm:mb-4')}>{t('chooseMaster')}</p>
              <div className={cn('grid grid-cols-1 md:grid-cols-2', compact ? 'gap-1.5' : 'gap-3')}>
                {availableStaff.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedStaffId(member.id)
                      setSelectedTime(null)
                    }}
                    className={cn(
                      'w-full text-left rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0',
                      compact ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4',
                      selectedStaffId === member.id
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border/60 hover:border-primary/40'
                    )}
                  >
                    <div className={cn('flex items-center gap-2', compact && 'gap-2')}>
                      <div
                        className={cn('rounded-full flex items-center justify-center text-white font-semibold', compact ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm')}
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className={cn('font-semibold', compact && 'text-xs')}>{member.name}</p>
                        <p className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-[11px] sm:text-xs')}>{member.category}</p>
                      </div>
                    </div>
                    {member.description && !compact && (
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">{member.description}</p>
                    )}
                    {!compact && (
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">
                        {t('schedulePrefix')}: {member.workingHours.start}–{member.workingHours.end}
                      </p>
                    )}
                  </button>
                ))}
                {availableStaff.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center">
                    {t('noMasters')}
                  </div>
                )}
              </div>
            </div>

            <div className={cn('text-center', currentStep !== 3 && 'hidden', compact && 'py-0')}>
              <div className={cn('flex items-center justify-center gap-2', compact ? 'mb-1 gap-1.5' : 'sm:gap-3 mb-2')}>
                <span className={cn('inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/15 font-bold text-primary', compact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 sm:h-7 sm:w-7 text-[10px] sm:text-xs')}>
                  3
                </span>
                <h3 className={cn('font-display font-semibold', compact ? 'text-sm' : 'text-base sm:text-lg')}>{t('dateTimeTitle')}</h3>
              </div>
              <p className={cn('font-medium text-foreground/80 text-left', compact ? 'text-[10px] sm:text-xs mb-1.5' : 'text-xs sm:text-sm mb-3 sm:mb-4')}>{t('chooseSlot')}</p>
              <div className={cn('grid grid-cols-1 md:grid-cols-3', compact ? 'gap-1.5 sm:gap-2' : 'gap-3 sm:gap-4')}>
                <div className="md:col-span-1">
                  <label className={cn('block font-medium', compact ? 'text-[10px] sm:text-xs mb-1' : 'text-xs sm:text-sm mb-2')}>{t('dateLabel')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarDate(new Date(selectedDate + 'T00:00:00'))
                      setIsDatePickerOpen(true)
                    }}
                    className={cn('w-full rounded-lg border border-border/60 bg-card/40 text-foreground flex items-center justify-between hover:border-primary/40 transition', compact ? 'px-2 py-2 text-[10px] sm:text-xs' : 'px-4 py-3 sm:py-3.5 text-xs sm:text-sm')}
                  >
                    <span className="text-left leading-snug whitespace-normal">
                      {formatDisplayDate(selectedDate)}
                    </span>
                    <CalendarIcon className={cn('text-muted-foreground', compact ? 'h-3 w-3' : 'h-4 w-4')} />
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className={cn('font-medium', compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm')}>{t('timeLabel')}</label>
                  <div className={cn('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5', compact ? 'gap-1 mt-1' : 'mt-2 gap-2')}>
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        disabled={!selectedService || !selectedStaffId || busySlots.has(slot)}
                        className={cn(
                          'rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
                          compact ? 'px-1.5 py-1.5 text-[10px] sm:text-xs' : 'px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm',
                          selectedTime === slot
                            ? 'border-primary/60 bg-primary text-primary-foreground'
                            : busySlots.has(slot)
                              ? 'border-red-500/40 bg-red-500/15 text-red-400 cursor-not-allowed'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/15',
                          selectedTime === slot
                            ? 'focus-visible:ring-primary/40'
                            : busySlots.has(slot)
                              ? 'focus-visible:ring-red-500/40'
                              : 'focus-visible:ring-emerald-500/40',
                          (!selectedService || !selectedStaffId) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={cn('text-center', currentStep !== 4 && 'hidden')}>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-[10px] sm:text-xs font-bold text-primary">
                  4
                </span>
                <h3 className="text-base sm:text-lg font-display font-semibold">{t('contactsTitle')}</h3>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground/80 text-left mb-3 sm:mb-4">{t('fillDetails')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder={t('namePlaceholder')}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-11 sm:h-12 text-sm sm:text-base bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <Input
                  placeholder={t('phonePlaceholder')}
                  value={clientPhone}
                  onChange={(e) => {
                    const raw = e.target.value
                    const sanitized = raw.replace(/[^\d+]/g, '')
                    const normalized = sanitized.startsWith('+')
                      ? `+${sanitized.slice(1).replace(/\+/g, '')}`
                      : sanitized.replace(/\+/g, '')
                    setClientPhone(normalized)
                  }}
                    inputMode="tel"
                    pattern="[0-9+]*"
                    className={cn('bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30', compact ? 'h-8 sm:h-9 text-xs' : 'h-11 sm:h-12 text-sm sm:text-base')}
                  />
                  <Input
                    placeholder={t('emailPlaceholder')}
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className={cn('bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30', compact ? 'h-8 sm:h-9 text-xs' : 'h-11 sm:h-12 text-sm sm:text-base')}
                  />
                  <Input
                    placeholder={t('commentPlaceholder')}
                    value={clientComment}
                    onChange={(e) => setClientComment(e.target.value)}
                    className={cn('bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30', compact ? 'h-8 sm:h-9 text-xs' : 'h-11 sm:h-12 text-sm sm:text-base')}
                  />
                  <div className={cn(compact ? 'space-y-1' : 'space-y-2')}>
                    <p className={cn('font-medium text-foreground/80 whitespace-nowrap', compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm')}>
                      {t('contactMethodLabel')}
                    </p>
                    <div ref={socialRef} className="relative w-full z-40">
                      <button
                        type="button"
                        onClick={() => setIsSocialOpen((prev) => !prev)}
                        className={cn(
                          'w-full rounded-md bg-card/40 border px-3 pr-10 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 text-left transition',
                          compact ? 'h-8 sm:h-9 text-xs pr-8' : 'h-11 sm:h-12 text-sm sm:text-base pr-10',
                          isSocialOpen ? 'border-primary/40' : 'border-border/60 hover:border-primary/30'
                        )}
                      >
                      {clientSocialMethod || t('contactMethodPlaceholder')}
                    </button>
                    <ChevronDown
                      className={cn(
                        'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform',
                        isSocialOpen && 'rotate-180'
                      )}
                    />
                    {isSocialOpen && (
                      <div className="absolute left-0 right-0 mt-2 rounded-md border border-border/60 bg-[#1b1f27] shadow-[0_18px_40px_rgba(0,0,0,0.35)] z-50 overflow-hidden">
                        {socialOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setClientSocialMethod(option)
                              setIsSocialOpen(false)
                            }}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm sm:text-base transition',
                              clientSocialMethod === option
                                ? 'bg-primary/15 text-foreground'
                                : 'text-foreground/90 hover:bg-primary/10'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                  <div className={compact ? 'mt-2' : 'mt-4 sm:mt-6'}>
                  <Input
                    placeholder={t('contactHandlePlaceholder')}
                    value={clientSocialHandle}
                    onChange={(e) => setClientSocialHandle(e.target.value)}
                    className={cn('bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30', compact ? 'h-8 sm:h-9 text-xs' : 'h-11 sm:h-12 text-sm sm:text-base')}
                  />
                </div>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div className={cn('flex items-end gap-3 shrink-0', compact ? 'mt-2 gap-2' : 'mt-6')}>
              <div className="ml-auto flex items-center gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  >
                    {t('back')}
                  </Button>
                )}
                {currentStep < 4 && (
                  <Button
                    onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                    disabled={!canProceed(currentStep)}
                  >
                    {t('next')}
                  </Button>
                )}
                {currentStep === 4 && (
                  <Button onClick={handleSubmit} disabled={!canProceed(4)}>
                    {t('sendRequest')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        <div className={cn('hidden lg:block h-full', compact && 'min-h-0')}>
          <div className={cn('h-full rounded-2xl border border-border/60 bg-card/70 flex flex-col shadow-[0_18px_40px_rgba(0,0,0,0.35)]', compact ? 'min-h-0 px-3 py-3' : 'min-h-[520px] px-5 py-6')}>
            <div className="flex items-center justify-center shrink-0">
              <h3 className={cn('font-display font-bold text-foreground text-center', compact ? 'text-sm' : 'text-xl')}>
                {t('yourBooking')}
              </h3>
            </div>
            <div className={cn('space-y-3 text-sm flex-1 min-h-0 overflow-hidden', compact ? 'mt-2 space-y-1.5 text-xs' : 'mt-5')}>
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span
                    className={cn(
                      'text-right max-w-[60%] break-words font-semibold',
                      item.filled ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.filled ? item.value : '—'}
                  </span>
                </div>
              ))}
            </div>
                <div className={cn('flex items-center justify-between rounded-xl border border-border/50 bg-background/40 shrink-0', compact ? 'mt-2 px-2 py-2 text-xs' : 'mt-5 px-4 py-3 text-sm')}>
                  <span className="text-muted-foreground">{t('priceLabel')}</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedService ? `${selectedService.price} MDL` : '—'}
                  </span>
                </div>
          </div>
        </div>
      </div>
    </section>
  )
}
