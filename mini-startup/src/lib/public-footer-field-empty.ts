/** Маркер в localStorage: поле футера намеренно очищено (иначе пустая строка = «не задано» и подставляется дефолт). */
export const FOOTER_FIELD_EMPTY_MARKER = '__empty__' as const

export function isFooterFieldClearedMarker(raw: string | null | undefined): boolean {
  return raw === FOOTER_FIELD_EMPTY_MARKER
}

export function displayFooterFieldStored(raw: string): string {
  return raw === FOOTER_FIELD_EMPTY_MARKER ? '' : raw
}

/** Пустой или пробельный ввод сохраняем как маркер. */
export function serializeFooterFieldForStorage(text: string): string {
  return text.trim() === '' ? FOOTER_FIELD_EMPTY_MARKER : text
}
