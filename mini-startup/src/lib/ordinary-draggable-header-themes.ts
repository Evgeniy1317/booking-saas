/**
 * Обычные (не premium) шаблоны с перетаскиваемым хедером.
 * Для всех id ниже одинаково: DraggableHeaderHair, черновики draft_headerLayout*,
 * превью-embed, моб. ручка/точки — см. PublicPage и ConstructorPage.
 */
export const ORDINARY_DRAGGABLE_HEADER_THEMES = [
  'hair',
  'barber',
  'cosmetology',
  'coloring',
  'manicure',
] as const

export type OrdinaryDraggableHeaderTheme = (typeof ORDINARY_DRAGGABLE_HEADER_THEMES)[number]

export function isOrdinaryDraggableHeaderTheme(theme: string): theme is OrdinaryDraggableHeaderTheme {
  return (ORDINARY_DRAGGABLE_HEADER_THEMES as readonly string[]).includes(theme)
}
