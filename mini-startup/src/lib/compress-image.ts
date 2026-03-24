/** Сжимает изображение для логотипа (localStorage) */
export function compressImageForLogo(dataUrl: string, onDone: (dataUrl: string) => void): void {
  const MAX_LENGTH = 450_000
  if (dataUrl.length <= MAX_LENGTH) {
    onDone(dataUrl)
    return
  }
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const max = 800
    let w = img.width
    let h = img.height
    if (w > max || h > max) {
      if (w > h) {
        h = Math.round((h * max) / w)
        w = max
      } else {
        w = Math.round((w * max) / h)
        h = max
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onDone(dataUrl)
      return
    }
    ctx.drawImage(img, 0, 0, w, h)
    let result = canvas.toDataURL('image/png')
    if (result.length > MAX_LENGTH) result = canvas.toDataURL('image/jpeg', 0.88)
    onDone(result)
  }
  img.onerror = () => onDone(dataUrl)
  img.src = dataUrl
}

/** Фон hero — больше лимит, шире картинка */
export function compressImageForHeroBg(dataUrl: string, onDone: (dataUrl: string) => void): void {
  const MAX_LENGTH = 2_200_000
  if (dataUrl.length <= MAX_LENGTH) {
    onDone(dataUrl)
    return
  }
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const max = 1920
    let w = img.width
    let h = img.height
    if (w > max || h > max) {
      if (w > h) {
        h = Math.round((h * max) / w)
        w = max
      } else {
        w = Math.round((w * max) / h)
        h = max
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onDone(dataUrl)
      return
    }
    ctx.drawImage(img, 0, 0, w, h)
    let result = canvas.toDataURL('image/jpeg', 0.85)
    if (result.length > MAX_LENGTH) result = canvas.toDataURL('image/jpeg', 0.72)
    onDone(result)
  }
  img.onerror = () => onDone(dataUrl)
  img.src = dataUrl
}
