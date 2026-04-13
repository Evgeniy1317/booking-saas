/**
 * Большие файлы hero-видео премиум-шаблона салона (premium-hair / premium-barber) не кладём в localStorage.
 */

import { HERO_VIDEO_USE_IDB_MIN_BYTES } from '@/lib/massage-hero-video-idb'

export { HERO_VIDEO_USE_IDB_MIN_BYTES }

export const SALON_PREMIUM_HERO_VIDEO_IDB_MARKER = '__salonPremiumHeroVideoBlob__'

const DB_NAME = 'miniStartupSalonPremiumHeroVideo'
const DB_VERSION = 1
const STORE = 'blob'

function idbKey(slug: string, themeTid: string): string {
  return `${slug}::${themeTid}`
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
  })
}

export async function saveSalonPremiumHeroVideoBlob(slug: string, themeTid: string, file: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB write aborted'))
    tx.objectStore(STORE).put(file, idbKey(slug, themeTid))
  })
}

export async function getSalonPremiumHeroVideoBlob(slug: string, themeTid: string): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const r = tx.objectStore(STORE).get(idbKey(slug, themeTid))
    r.onsuccess = () => resolve((r.result as Blob | undefined) ?? null)
    r.onerror = () => reject(r.error ?? new Error('IndexedDB read failed'))
  })
}

export async function deleteSalonPremiumHeroVideoBlob(slug: string, themeTid: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'))
    tx.objectStore(STORE).delete(idbKey(slug, themeTid))
  })
}

export async function loadSalonPremiumHeroVideoObjectUrl(slug: string, themeTid: string): Promise<string | null> {
  const blob = await getSalonPremiumHeroVideoBlob(slug, themeTid)
  if (!blob || blob.size === 0) return null
  return URL.createObjectURL(blob)
}
