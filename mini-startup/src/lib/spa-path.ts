/**
 * GitHub Pages для project site не отдаёт index.html на пути /repo/login → 404.
 * В проде с Vite base ≠ "/" используем hash-роутинг: /repo/#/login
 */
export const useHashRouter =
  import.meta.env.PROD &&
  import.meta.env.BASE_URL !== '/' &&
  import.meta.env.BASE_URL !== ''

/**
 * Путь для iframe / window.open: `/repo/#/b/slug?…` или `/repo/b/slug?…` локально.
 * @param pathWithQuery путь приложения с ведущим /, напр. `/login` или `/b/x?preview=1`
 */
export function spaRouteHref(pathWithQuery: string): string {
  const raw = import.meta.env.BASE_URL || '/'
  const path = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`

  if (useHashRouter) {
    const prefix = raw.endsWith('/') ? raw.slice(0, -1) : raw
    return `${prefix}/#${path}`
  }

  if (raw === '/') {
    return path
  }

  const prefix = raw.endsWith('/') ? raw.slice(0, -1) : raw
  return `${prefix}${path}`
}

/** Полный URL для QR и шаринга */
export function spaAbsoluteUrl(pathWithQuery: string): string {
  const href = spaRouteHref(pathWithQuery)
  if (typeof window === 'undefined') {
    return href
  }
  if (href.startsWith('http')) {
    return href
  }
  return `${window.location.origin}${href}`
}
