import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

type LocationMapProps = {
  center: [number, number]
  zoom?: number
  enableDirections?: boolean
  label?: string
}

export default function LocationMap({
  center,
  zoom = 16,
  enableDirections = true,
  label,
}: LocationMapProps) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const markerElRef = useRef<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hasError, setHasError] = useState(false)
  const [photoInfo, setPhotoInfo] = useState<{ title: string; url: string } | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    try {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center,
        zoom,
        attributionControl: false,
      })

      mapRef.current.addControl(
        new maplibregl.NavigationControl({ showZoom: true, showCompass: false }),
        'bottom-right'
      )

      markerRef.current = new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat(center)
        .addTo(mapRef.current)
    } catch (error) {
      console.error('Map init failed:', error)
      setHasError(true)
    }

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [center, zoom])

  const openGoogleMaps = () => {
    const destination = `${center[1]},${center[0]}`
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setCenter(center)
    mapRef.current.setZoom(zoom)

    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat(center)
        .addTo(mapRef.current)
    } else {
      markerRef.current.setLngLat(center)
    }

    if (markerRef.current) {
      const element = markerRef.current.getElement()
      element.style.cursor = 'pointer'
      if (markerElRef.current && markerElRef.current !== element) {
        markerElRef.current.replaceWith(element)
      }
      markerElRef.current = element
    }
  }, [center, zoom])

  useEffect(() => {
    const [lng, lat] = center
    let isActive = true
    const fetchPhoto = async () => {
      try {
        const response = await fetch(
          `https://commons.wikimedia.org/w/api.php?format=json&origin=*&action=query&generator=geosearch&ggscoord=${lat}|${lng}&ggsradius=300&ggslimit=10&ggsnamespace=6&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=480`
        )
        const data = await response.json()
        const pages = data?.query?.pages ? Object.values<any>(data.query.pages) : []
        const withImage = pages.find((page) => {
          const info = page?.imageinfo?.[0]
          if (!info?.thumburl || !info?.mime) return false
          if (!info.mime.startsWith('image/')) return false
          if (info.mime === 'image/svg+xml') return false
          if (page.title && /map/i.test(page.title)) return false
          return true
        })
        if (!isActive) return
        if (withImage?.imageinfo?.[0]?.thumburl) {
          const title = (withImage.title || '').replace(/^File:/, '')
          setPhotoInfo({ title, url: withImage.imageinfo[0].thumburl })
        } else {
          setPhotoInfo(null)
        }
      } catch (error) {
        if (isActive) setPhotoInfo(null)
      }
    }
    fetchPhoto()
    return () => {
      isActive = false
    }
  }, [center])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (!photoInfo) {
      popupRef.current?.remove()
      popupRef.current = null
      return
    }

    const popupContainer = document.createElement('div')
    popupContainer.className = 'flex flex-col gap-2 max-w-[220px]'
    const img = document.createElement('img')
    img.src = photoInfo.url
    img.alt = label || photoInfo.title
    img.className = 'w-full h-28 object-cover rounded-lg'
    const title = document.createElement('div')
    title.className = 'text-sm font-semibold text-foreground'
    title.textContent = label || photoInfo.title
    const hint = document.createElement('div')
    hint.className = 'text-[11px] text-muted-foreground'
    hint.textContent = 'Посмотреть на карте'
    popupContainer.appendChild(img)
    popupContainer.appendChild(title)
    popupContainer.appendChild(hint)

    popupRef.current?.remove()
    popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })
      .setDOMContent(popupContainer)
      .setLngLat(center)
      .addTo(mapRef.current)
  }, [center, photoInfo, label])

  useEffect(() => {
    if (!markerElRef.current || !enableDirections) return
    const handleMarkerClick = (event: MouseEvent) => {
      event.stopPropagation()
      openGoogleMaps()
    }
    markerElRef.current.addEventListener('click', handleMarkerClick)
    return () => {
      markerElRef.current?.removeEventListener('click', handleMarkerClick)
    }
  }, [enableDirections, center])

  if (hasError) {
    return <div className="h-full w-full rounded-2xl bg-card/40" />
  }

  return (
    <div
      className="group relative h-full w-full rounded-2xl overflow-hidden"
      onClick={() => {
        if (enableDirections) openGoogleMaps()
      }}
    >
      <div ref={containerRef} className="h-full w-full" />
      <button
        type="button"
        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border border-border/60 text-xs font-medium text-foreground px-3 py-1.5 rounded-full shadow-md"
        onClick={(event) => {
          event.stopPropagation()
          openGoogleMaps()
        }}
      >
        Посмотреть на карте
      </button>
    </div>
  )
}


