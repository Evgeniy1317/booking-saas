import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Нормализация номера телефона для поиска (удаляет все кроме цифр)
export function normalizePhoneForSearch(phone: string): string {
  // Удаляем все символы кроме цифр
  let normalized = phone.replace(/\D/g, '')
  
  // Если номер начинается с 373, оставляем как есть, иначе добавляем 373
  if (normalized && !normalized.startsWith('373')) {
    normalized = '373' + normalized
  }
  
  return normalized
}

// Функция поиска по имени и телефону
export function matchesSearchQuery(item: { client?: string; name?: string; phone?: string }, query: string): boolean {
  if (!query || !query.trim()) return true
  
  const queryLower = query.toLowerCase().trim()
  
  // Поиск по имени (без учета регистра)
  const name = (item.client || item.name || '').toLowerCase().trim()
  const nameMatch = name.includes(queryLower)
  
  // Поиск по телефону (с учетом нормализации - удаляем все кроме цифр)
  if (item.phone) {
    const queryDigits = query.replace(/\D/g, '') // Только цифры из запроса
    const phoneDigits = item.phone.replace(/\D/g, '') // Только цифры из телефона
    
    // Если в запросе есть цифры, ищем по цифрам
    if (queryDigits.length > 0) {
      const phoneMatch = phoneDigits.includes(queryDigits)
      return nameMatch || phoneMatch
    }
    
    // Если в запросе только буквы/символы, ищем по полному телефону (на случай если есть буквы в номере)
    const phoneMatch = item.phone.toLowerCase().includes(queryLower)
    return nameMatch || phoneMatch
  }
  
  return nameMatch
}