/** Пять обычных шаблонов — те же id, что у ORDINARY_THEMES в парикмахерском конструкторе. */
export const MASSAGE_ORDINARY_TEMPLATE_IDS = [
  'hair',
  'barber',
  'cosmetology',
  'coloring',
  'manicure',
] as const

export type MassageOrdinaryTemplateId = (typeof MASSAGE_ORDINARY_TEMPLATE_IDS)[number]

export function isMassageOrdinaryTemplateId(s: string): s is MassageOrdinaryTemplateId {
  return (MASSAGE_ORDINARY_TEMPLATE_IDS as readonly string[]).includes(s)
}

/** Отдельный премиум-шаблон массажного сайта (прежний «богатый» вид). */
export const PREMIUM_MASSAGE_SLOT = 'premium-massage' as const

export const MASSAGE_PREMIUM_TEMPLATE_IDS = [PREMIUM_MASSAGE_SLOT] as const

export type MassagePremiumTemplateId = (typeof MASSAGE_PREMIUM_TEMPLATE_IDS)[number]

export const MASSAGE_TEMPLATE_SLOT_IDS = [
  ...MASSAGE_ORDINARY_TEMPLATE_IDS,
  ...MASSAGE_PREMIUM_TEMPLATE_IDS,
] as const

export type MassageTemplateSlotId = (typeof MASSAGE_TEMPLATE_SLOT_IDS)[number]

export function isMassagePremiumTemplateId(s: string): s is MassagePremiumTemplateId {
  return (MASSAGE_PREMIUM_TEMPLATE_IDS as readonly string[]).includes(s)
}

export function isMassageTemplateSlotId(s: string): s is MassageTemplateSlotId {
  return (MASSAGE_TEMPLATE_SLOT_IDS as readonly string[]).includes(s)
}
