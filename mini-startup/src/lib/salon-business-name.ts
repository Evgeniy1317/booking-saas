/**
 * Единое имя салона для админки, публичного сайта и конструктора.
 * Приоритет как на главной дашборда (Home): сначала businessName из регистрации,
 * затем опубликованное publicName и имя из настроек конструктора.
 */
export function getCanonicalSalonBusinessName(): string {
  if (typeof window === 'undefined') return ''
  return (
    localStorage.getItem('businessName') ||
    localStorage.getItem('publicName') ||
    localStorage.getItem('constructorBusinessName') ||
    ''
  ).trim()
}
