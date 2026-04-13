import {
  isMassageOrdinaryTemplateId,
  type MassageOrdinaryTemplateId,
} from '@/lib/massage-template-registry'

import massageClassicBodyPatternBg from '@/assets/images/massage-images/12634.jpg'
import massageThaiBodyPatternBg from '@/assets/images/massage-images/8510396.jpg'
import massageStoneBodyPatternBg from '@/assets/images/massage-images/8377220.jpg'
import massageAntistressBodyPatternBg from '@/assets/images/massage-images/7771380.jpg'
import massageSportsBodyPatternBg from '@/assets/images/massage-images/8498517.jpg'

export const MASSAGE_BODY_PATTERN_BY_TEMPLATE: Record<MassageOrdinaryTemplateId, string> = {
  hair: massageClassicBodyPatternBg,
  barber: massageThaiBodyPatternBg,
  cosmetology: massageStoneBodyPatternBg,
  coloring: massageAntistressBodyPatternBg,
  manicure: massageSportsBodyPatternBg,
}

export const MASSAGE_BODY_PATTERN_ORDER: MassageOrdinaryTemplateId[] = [
  'hair',
  'barber',
  'cosmetology',
  'coloring',
  'manicure',
]

export function resolveMassageBodyPatternAssetUrl(
  choiceStored: string | null | undefined,
  activeSlot: MassageOrdinaryTemplateId
): string {
  const t = (choiceStored ?? '').trim()
  if (isMassageOrdinaryTemplateId(t)) return MASSAGE_BODY_PATTERN_BY_TEMPLATE[t]
  return MASSAGE_BODY_PATTERN_BY_TEMPLATE[activeSlot]
}

/**
 * Размер слоя `background-size` для плитки (repeat). У 12634.jpg очень большое разрешение —
 * при `auto` на экране видна одна «растянутая» плитка; фиксируем ширину плитки, высота по пропорции.
 */
export function massageBodyPatternLayerBackgroundSize(patternUrl: string): string {
  return patternUrl === MASSAGE_BODY_PATTERN_BY_TEMPLATE.hair ? '280px' : 'auto'
}
