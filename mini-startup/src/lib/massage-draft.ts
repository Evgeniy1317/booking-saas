import { useState, useEffect, useCallback } from 'react'

export const MASSAGE_DRAFT_PREFIX = 'massage_draft_'

export function getMassageDraft(key: string): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(MASSAGE_DRAFT_PREFIX + key) ?? ''
}

/** Обновляет превью «Полный размер» при изменении localStorage из другой вкладки и по таймеру */
export function useMassageDraftSnapshot(): number {
  const [v, setV] = useState(0)
  const refresh = useCallback(() => setV(x => x + 1), [])
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith(MASSAGE_DRAFT_PREFIX)) refresh()
    }
    window.addEventListener('storage', onStorage)
    const t = window.setInterval(refresh, 500)
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [refresh])
  return v
}
