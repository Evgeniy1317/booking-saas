/** Видео hero больше порога не храним в localStorage (квота), а в IndexedDB. */

export const MASSAGE_HERO_VIDEO_IDB_MARKER = '__massageHeroVideoBlob__'

/** Видео в hero всегда в IndexedDB (localStorage не выдерживает большие файлы). */
export const HERO_VIDEO_USE_IDB_MIN_BYTES = 0

const DB_NAME = 'miniStartupMassageBlobs'
const DB_VERSION = 1
const STORE = 'heroVideo'

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

export async function saveMassageHeroVideoBlob(slot: string, file: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB write aborted'))
    tx.objectStore(STORE).put(file, slot)
  })
}

export async function getMassageHeroVideoBlob(slot: string): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const r = tx.objectStore(STORE).get(slot)
    r.onsuccess = () => resolve((r.result as Blob | undefined) ?? null)
    r.onerror = () => reject(r.error ?? new Error('IndexedDB read failed'))
  })
}

export async function deleteMassageHeroVideoBlob(slot: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'))
    tx.objectStore(STORE).delete(slot)
  })
}

export async function loadMassageHeroVideoObjectUrl(slot: string): Promise<string | null> {
  const blob = await getMassageHeroVideoBlob(slot)
  if (!blob || blob.size === 0) return null
  return URL.createObjectURL(blob)
}
