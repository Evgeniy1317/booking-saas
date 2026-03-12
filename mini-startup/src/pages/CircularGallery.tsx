import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import { useEffect, useMemo, useRef, useState } from 'react'

type GL = Renderer['gl']

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout)
    timeout = window.setTimeout(() => func.apply(this, args), wait)
  }
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance)
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance)
    }
  })
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/)
  return match ? parseInt(match[1], 10) : 30
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = 'bold 30px monospace',
  color: string = 'black'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not get 2d context')

  context.font = font
  const metrics = context.measureText(text)
  const textWidth = Math.ceil(metrics.width)
  const fontSize = getFontSize(font)
  const textHeight = Math.ceil(fontSize * 1.2)

  canvas.width = textWidth + 20
  canvas.height = textHeight + 20

  context.font = font
  context.fillStyle = color
  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return { texture, width: canvas.width, height: canvas.height }
}

interface TitleProps {
  gl: GL
  plane: Mesh
  renderer: Renderer
  text: string
  textColor?: string
  font?: string
}

class Title {
  gl: GL
  plane: Mesh
  renderer: Renderer
  text: string
  textColor: string
  font: string
  mesh!: Mesh

  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }: TitleProps) {
    autoBind(this)
    this.gl = gl
    this.plane = plane
    this.renderer = renderer
    this.text = text
    this.textColor = textColor
    this.font = font
    this.createMesh()
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor)
    const geometry = new Plane(this.gl)
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    })
    this.mesh = new Mesh(this.gl, { geometry, program })
    const aspect = width / height
    const textHeightScaled = this.plane.scale.y * 0.15
    const textWidthScaled = textHeightScaled * aspect
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1)
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05
    this.mesh.setParent(this.plane)
  }
}

interface ScreenSize {
  width: number
  height: number
}

interface Viewport {
  width: number
  height: number
}

interface MediaProps {
  geometry: Plane
  gl: GL
  image: string
  index: number
  length: number
  renderer: Renderer
  scene: Transform
  screen: ScreenSize
  text: string
  viewport: Viewport
  bend: number
  textColor: string
  borderRadius?: number
  font?: string
}

class Media {
  extra: number = 0
  geometry: Plane
  gl: GL
  image: string
  index: number
  length: number
  renderer: Renderer
  scene: Transform
  screen: ScreenSize
  text: string
  viewport: Viewport
  bend: number
  textColor: string
  borderRadius: number
  font?: string
  program!: Program
  plane!: Mesh
  title!: Title
  scale!: number
  padding!: number
  width!: number
  widthTotal!: number
  x!: number
  speed: number = 0
  isBefore: boolean = false
  isAfter: boolean = false

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }: MediaProps) {
    this.geometry = geometry
    this.gl = gl
    this.image = image
    this.index = index
    this.length = length
    this.renderer = renderer
    this.scene = scene
    this.screen = screen
    this.text = text
    this.viewport = viewport
    this.bend = bend
    this.textColor = textColor
    this.borderRadius = borderRadius
    this.font = font
    this.createShader()
    this.createMesh()
    this.createTitle()
    this.onResize()
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    })
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    })
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = this.image
    img.onload = () => {
      texture.image = img
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight]
    }
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    })
    this.plane.setParent(this.scene)
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    })
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra

    const x = this.plane.position.x
    const h = this.viewport.width / 2

    if (this.bend === 0) {
      this.plane.position.y = 0
      this.plane.rotation.z = 0
    } else {
      const bendAbs = Math.abs(this.bend)
      const r = (h * h + bendAbs * bendAbs) / (2 * bendAbs)
      const effectiveX = Math.min(Math.abs(x), h)

      const arc = r - Math.sqrt(r * r - effectiveX * effectiveX)
      if (this.bend > 0) {
        this.plane.position.y = -arc
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / r)
      } else {
        this.plane.position.y = arc
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / r)
      }
    }

    this.speed = scroll.current - scroll.last
    this.program.uniforms.uTime.value += 0.04
    this.program.uniforms.uSpeed.value = this.speed

    const planeOffset = this.plane.scale.x / 2
    const viewportOffset = this.viewport.width / 2
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal
      this.isBefore = this.isAfter = false
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal
      this.isBefore = this.isAfter = false
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen
    if (viewport) {
      this.viewport = viewport
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height]
      }
    }
    this.scale = this.screen.height / 1500
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
    this.padding = 2
    this.width = this.plane.scale.x + this.padding
    this.widthTotal = this.width * this.length
    this.x = this.width * this.index
  }
}

interface AppConfig {
  items?: { image: string; text: string }[]
  bend?: number
  textColor?: string
  borderRadius?: number
  font?: string
  scrollSpeed?: number
  scrollEase?: number
  enableWheel?: boolean
  onItemClick?: (image: string) => void
}

class App {
  container: HTMLElement
  items: { image: string; text: string }[]
  onItemClick?: (image: string) => void
  scrollSpeed: number
  enableWheel: boolean
  scroll: {
    ease: number
    current: number
    target: number
    last: number
    position?: number
  }
  onCheckDebounce: (...args: any[]) => void
  renderer!: Renderer
  gl!: GL
  camera!: Camera
  scene!: Transform
  planeGeometry!: Plane
  medias: Media[] = []
  mediasImages: { image: string; text: string }[] = []
  screen!: { width: number; height: number }
  viewport!: { width: number; height: number }
  raf: number = 0

  boundOnResize!: () => void
  boundOnWheel!: (e: Event) => void
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void
  boundOnTouchUp!: () => void
  boundOnClick!: (e: MouseEvent) => void

  isDown: boolean = false
  start: number = 0
  hasMoved: boolean = false
  lastDragTime: number = 0

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05,
      enableWheel = true,
      onItemClick
    }: AppConfig
  ) {
    document.documentElement.classList.remove('no-js')
    this.container = container
    this.scrollSpeed = scrollSpeed
    this.enableWheel = enableWheel
    this.items = items && items.length ? items : []
    this.onItemClick = onItemClick
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 }
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200)
    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.onResize()
    this.createGeometry()
    this.createMedias(items, bend, textColor, borderRadius, font)
    this.update()
    this.addEventListeners()
    if (this.onItemClick) {
      this.container.addEventListener('click', this.boundOnClick)
    }
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    })
    this.gl = this.renderer.gl
    if (!this.gl) {
      throw new Error('WebGL context not available')
    }
    this.gl.clearColor(0, 0, 0, 0)
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement)
  }

  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
  }

  createScene() {
    this.scene = new Transform()
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    })
  }

  createMedias(
    items: { image: string; text: string }[] | undefined,
    bend: number = 1,
    textColor: string,
    borderRadius: number,
    font: string
  ) {
    const defaultItems = [
      { image: 'https://picsum.photos/seed/1/800/600?grayscale', text: 'Bridge' },
      { image: 'https://picsum.photos/seed/2/800/600?grayscale', text: 'Desk Setup' },
      { image: 'https://picsum.photos/seed/3/800/600?grayscale', text: 'Waterfall' },
      { image: 'https://picsum.photos/seed/4/800/600?grayscale', text: 'Strawberries' },
      { image: 'https://picsum.photos/seed/5/800/600?grayscale', text: 'Deep Diving' },
      { image: 'https://picsum.photos/seed/16/800/600?grayscale', text: 'Train Track' },
      { image: 'https://picsum.photos/seed/17/800/600?grayscale', text: 'Santorini' },
      { image: 'https://picsum.photos/seed/8/800/600?grayscale', text: 'Blurry Lights' },
      { image: 'https://picsum.photos/seed/9/800/600?grayscale', text: 'New York' },
      { image: 'https://picsum.photos/seed/10/800/600?grayscale', text: 'Good Boy' },
      { image: 'https://picsum.photos/seed/21/800/600?grayscale', text: 'Coastline' },
      { image: 'https://picsum.photos/seed/12/800/600?grayscale', text: 'Palm Trees' }
    ]
    const galleryItems = items && items.length ? items : defaultItems
    this.mediasImages = galleryItems.concat(galleryItems)
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      })
    })
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true
    this.hasMoved = false
    this.scroll.position = this.scroll.current
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return
    if ('buttons' in e && e.buttons !== 1) {
      this.isDown = false
      return
    }
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const distance = (this.start - x) * (this.scrollSpeed * 0.025)
    if (Math.abs(this.start - x) > 6) {
      this.hasMoved = true
    }
    this.scroll.target = (this.scroll.position ?? 0) + distance
  }

  onTouchUp() {
    this.isDown = false
    if (this.hasMoved) {
      this.lastDragTime = window.performance.now()
    }
    this.onCheck()
  }

  onClick(e: MouseEvent) {
    if (!this.onItemClick || !this.items.length || !this.medias[0]) return
    const now = window.performance.now()
    if (this.hasMoved || now - this.lastDragTime < 150) return
    const rect = this.container.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const targetX = (localX - rect.width / 2) * (this.viewport.width / this.screen.width)
    const closest = this.medias.reduce(
      (acc, media) => {
        const distance = Math.abs(media.plane.position.x - targetX)
        if (distance < acc.distance) {
          return { media, distance }
        }
        return acc
      },
      { media: this.medias[0], distance: Number.POSITIVE_INFINITY }
    )
    const index = closest.media.index % this.items.length
    this.onItemClick(this.items[index].image)
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent
    const deltaY = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail || 0
    const deltaX = wheelEvent.deltaX || 0
    const prefersHorizontal = Math.abs(deltaX) > Math.abs(deltaY)
    const shouldUseWheel = prefersHorizontal || wheelEvent.shiftKey
    if (!shouldUseWheel) return
    const delta = wheelEvent.shiftKey ? deltaY : deltaX
    if (!delta) return
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2
    this.onCheckDebounce()
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return
    const width = this.medias[0].width
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width)
    const item = width * itemIndex
    this.scroll.target = this.scroll.target < 0 ? -item : item
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    }
    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    })
    const fov = (this.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect
    this.viewport = { width, height }
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }))
    }
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left'
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction))
    }
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scroll.last = this.scroll.current
    this.raf = window.requestAnimationFrame(this.update.bind(this))
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this)
    this.boundOnWheel = this.onWheel.bind(this)
    this.boundOnTouchDown = this.onTouchDown.bind(this)
    this.boundOnTouchMove = this.onTouchMove.bind(this)
    this.boundOnTouchUp = this.onTouchUp.bind(this)
    this.boundOnClick = this.onClick.bind(this)
    window.addEventListener('resize', this.boundOnResize)
    if (this.enableWheel) {
      this.container.addEventListener('mousewheel', this.boundOnWheel, { passive: true })
      this.container.addEventListener('wheel', this.boundOnWheel, { passive: true })
    }
    this.container.addEventListener('mousedown', this.boundOnTouchDown)
    this.container.addEventListener('mousemove', this.boundOnTouchMove)
    this.container.addEventListener('mouseup', this.boundOnTouchUp)
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true })
    this.container.addEventListener('touchmove', this.boundOnTouchMove, { passive: true })
    this.container.addEventListener('touchend', this.boundOnTouchUp)
  }

  destroy() {
    window.cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.boundOnResize)
    if (this.enableWheel) {
      this.container.removeEventListener('mousewheel', this.boundOnWheel)
      this.container.removeEventListener('wheel', this.boundOnWheel)
    }
    this.container.removeEventListener('mousedown', this.boundOnTouchDown)
    this.container.removeEventListener('mousemove', this.boundOnTouchMove)
    this.container.removeEventListener('mouseup', this.boundOnTouchUp)
    this.container.removeEventListener('touchstart', this.boundOnTouchDown)
    this.container.removeEventListener('touchmove', this.boundOnTouchMove)
    this.container.removeEventListener('touchend', this.boundOnTouchUp)
    if (this.onItemClick) {
      this.container.removeEventListener('click', this.boundOnClick)
    }
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement)
    }
  }
}

interface CircularGalleryProps {
  items?: { image: string; text: string }[]
  bend?: number
  textColor?: string
  borderRadius?: number
  font?: string
  scrollSpeed?: number
  scrollEase?: number
  enableWheel?: boolean
  onItemClick?: (image: string) => void
}

export default function CircularGallery({
  items,
  bend = 1,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05,
  enableWheel = true,
  onItemClick
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<App | null>(null)
  const [disabled, setDisabled] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const fallbackItems = useMemo(() => items?.filter((item) => item.image) ?? [], [items])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries[0]?.isIntersecting ?? true)
      },
      { rootMargin: '200px' }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    if (!isInView) {
      appRef.current?.destroy()
      appRef.current = null
      return
    }
    if (appRef.current) return
    const canvas = document.createElement('canvas')
    const supportsWebgl = Boolean(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    )
    if (!supportsWebgl) {
      setDisabled(true)
      return
    }
    try {
      appRef.current = new App(containerRef.current, {
        items,
        bend,
        textColor,
        borderRadius,
        font,
        scrollSpeed,
        scrollEase,
        enableWheel,
        onItemClick
      })
    } catch (error) {
      setDisabled(true)
      appRef.current = null
    }
    return () => {
      appRef.current?.destroy()
      appRef.current = null
    }
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, enableWheel, onItemClick, isInView])
  if (disabled) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-center gap-4 overflow-x-auto px-6 py-4">
          {fallbackItems.map((item, index) => (
            <button
              key={`${item.image}-${index}`}
              type="button"
              className="h-40 w-56 rounded-2xl overflow-hidden border border-white/15 bg-black/30 flex-shrink-0"
              onClick={() => onItemClick?.(item.image)}
            >
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    )
  }
  return <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" ref={containerRef} />
}
