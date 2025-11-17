'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface MapProps {
  center?: [number, number]
  zoom?: number
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void
  markers?: Array<{
    id: string
    latitude: number
    longitude: number
    type: 'pickup' | 'dropoff' | 'driver'
    label?: string
  }>
  showRoute?: boolean
  routeCoordinates?: Array<[number, number]>
}

export default function Map({
  center = [-122.4194, 37.7749], // San Francisco
  zoom = 12,
  onLocationSelect,
  markers = [],
  showRoute = false,
  routeCoordinates = [],
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'top-right'
    )

    map.current.on('load', () => {
      setIsLoading(false)
    })

    if (onLocationSelect) {
      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat

        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
          )
          const data = await response.json()
          const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address,
          })
        } catch (error) {
          console.error('Geocoding error:', error)
        }
      })
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.width = '30px'
      el.style.height = '30px'
      el.style.borderRadius = '50%'
      el.style.cursor = 'pointer'

      if (markerData.type === 'pickup') {
        el.style.backgroundColor = '#10b981'
      } else if (markerData.type === 'dropoff') {
        el.style.backgroundColor = '#ef4444'
      } else if (markerData.type === 'driver') {
        el.style.backgroundColor = '#3b82f6'
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([markerData.longitude, markerData.latitude])
        .addTo(map.current!)

      if (markerData.label) {
        marker.setPopup(new mapboxgl.Popup().setHTML(`<p>${markerData.label}</p>`))
      }

      markersRef.current.push(marker)
    })
  }, [markers])

  // Draw route
  useEffect(() => {
    if (!map.current || !showRoute || routeCoordinates.length < 2) return

    if (map.current.getSource('route')) {
      map.current.removeLayer('route')
      map.current.removeSource('route')
    }

    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        },
      },
    })

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
      },
    })

    // Fit bounds to show entire route
    const bounds = new mapboxgl.LngLatBounds()
    routeCoordinates.forEach((coord) => bounds.extend(coord as [number, number]))
    map.current.fitBounds(bounds, { padding: 50 })
  }, [showRoute, routeCoordinates])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  )
}
