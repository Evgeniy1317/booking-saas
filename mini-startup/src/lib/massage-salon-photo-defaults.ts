import type { MassageOrdinaryTemplateId } from '@/lib/massage-template-registry'

import massageClassicHeroBg from '@/assets/images/massage-images/pexels-shkrabaanthony-4599396.jpg'
import massageThaiHeroBg from '@/assets/images/massage-images/pexels-tima-miroshnichenko-6188128.jpg'
import massageStoneHeroBg from '@/assets/images/massage-images/pexels-tima-miroshnichenko-6187657.jpg'
import massageAntistressHeroBg from '@/assets/images/massage-images/pexels-jonathanborba-19641822.jpg'
import massageSportsHeroBg from '@/assets/images/massage-images/pexels-jonathanborba-27730453.jpg'

const SLOT_ORDER: MassageOrdinaryTemplateId[] = [
  'hair',
  'barber',
  'cosmetology',
  'coloring',
  'manicure',
]

const HERO_BY_SLOT: Record<MassageOrdinaryTemplateId, string> = {
  hair: massageClassicHeroBg,
  barber: massageThaiHeroBg,
  cosmetology: massageStoneHeroBg,
  coloring: massageAntistressHeroBg,
  manicure: massageSportsHeroBg,
}

/**
 * Пять слотов блока «Фотографии салона» на PublicPage: те же кадры, что и hero у 5 тем.
 * Слот текущего шаблона — первый; остальные четыре — по кругу (все пять разные).
 */
export function getMassageSalonPhotoSlotDefaults(slot: MassageOrdinaryTemplateId): readonly string[] {
  const start = SLOT_ORDER.indexOf(slot)
  const rotated = start <= 0 ? SLOT_ORDER : [...SLOT_ORDER.slice(start), ...SLOT_ORDER.slice(0, start)]
  return rotated.map((s) => HERO_BY_SLOT[s])
}
