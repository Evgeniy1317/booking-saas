/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module 'qrcode' {
  const QRCode: {
    toDataURL: (
      text: string,
      options?: {
        width?: number
        margin?: number
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
      }
    ) => Promise<string>
  }
  export default QRCode
}