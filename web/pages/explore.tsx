import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import translation from '../libs/translation'
import CitySwitcher from '../components/citySwitcher'
import * as turf from '@turf/turf'
import logoImage from '../components/images/desalojamento_logo.png'
import {
  cityDefinitions,
  alPaint,
  alPaintMegaHost,
  freguesiaPaint,
  hotelsPaint,
} from '../components/extras/mapStyles'
import {
  getBothCitiesData,
  getMinMax,
  createMap,
  addSourcesAndLayersForBothCities,
  addCentroidMarkers,
  switchCity,
  setMarkerVisibility,
  updateMarkerValues,
} from '../components/extras/helpers'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1Ijoiam9hb2Jlcm5hcmNpc28iLCJhIjoiY2xlNjFmdWo5MDFnZTNvcHBoZmtwa2gyMSJ9.yDJ6Z-4Ig2XJC4IK4CJ4MQ'

const Explore = () => {
  const [language, setLanguage] = useState('pt')
  const [city, setCity] = useState<'Lisbon' | 'Porto'>('Lisbon')
  const [controlsOpen, setControlsOpen] = useState(false)

  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const centroidMarkersRef = useRef<any[]>([])
  const boundaryBoxRef = useRef<[number, number][]>([])
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const previousCityRef = useRef<string | null>(null)

  const [showFreguesiaMarkers, setShowFreguesiaMarkers] = useState(false)
  const [showMegahostColors, setShowMegahostColors] = useState(false)
  const [showHotels, setShowHotels] = useState(false)

  const citiesData = getBothCitiesData()

  // Override bounds for Explore using external city bounding boxes (Nominatim/OSM),
  // expressed as [[west, south], [east, north]]. We add padding later.
  const exploreBounds: Record<'Lisbon' | 'Porto', [number, number][]> = {
    Lisbon: [
      [-9.229433, 38.691399],
      [-9.090908, 38.807953],
    ],
    Porto: [
      [-8.6849, 41.1241],
      [-8.5533, 41.1835],
    ],
  }

  // City centers for Explore (no max bounds), [lng, lat]
  const exploreCenters: Record<'Lisbon' | 'Porto', [number, number]> = {
    Lisbon: [-9.1573, 38.7451],
    Porto: [-8.6291, 41.1579],
  }

  const normalizeBounds = useCallback((b: [number, number][]) => {
    if (!b || b.length !== 2) return b
    const [a, c] = b
    if (!a || !c || a.length !== 2 || c.length !== 2) return b
    const west = Math.min(a[0], c[0])
    const east = Math.max(a[0], c[0])
    const south = Math.min(a[1], c[1])
    const north = Math.max(a[1], c[1])
    return [
      [west, south],
      [east, north],
    ] as unknown as [number, number][]
  }, [])

  const padBounds = useCallback(
    (b: [number, number][], factor = 0.12) => {
      if (!b || b.length !== 2) return b
      const [sw, ne] = normalizeBounds(b)
      const dx = (ne[0] - sw[0]) * factor
      const dy = (ne[1] - sw[1]) * factor
      return [
        [sw[0] - dx, sw[1] - dy],
        [ne[0] + dx, ne[1] + dy],
      ] as unknown as [number, number][]
    },
    [normalizeBounds],
  )

  const initializeMap = useCallback(() => {
    if (!citiesData.isLoaded || mapRef.current) return

    const initialCityData = citiesData[city]
    if (!initialCityData?.freguesiaData) return

    const [minPop, maxPop] = getMinMax(initialCityData.freguesiaData, 'diff_pop_2011')
    const [minAloj, maxAloj] = getMinMax(initialCityData.freguesiaData, 'diff_alojamentos_2011')

    // Derive contextual paints (kept similar to main map)
    const freguesiaPaintPop: mapboxgl.FillPaint = {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'diff_pop_2011'],
        minPop,
        '#b3589a',
        0,
        '#FFFFFF',
        maxPop,
        '#b8ffcb',
      ],
      'fill-opacity': 0.1,
      'fill-color-transition': { duration: 500 },
    }

    const freguesiaPaintAL: mapboxgl.FillPaint = {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'diff_alojamentos_2011'],
        minAloj,
        '#b3589a',
        0,
        '#FFFFFF',
        maxAloj,
        '#b8ffcb',
      ],
      'fill-opacity': 0.1,
      'fill-color-transition': { duration: 500 },
    }

    mapRef.current = createMap(
      mapContainer.current,
      cityDefinitions,
      (b: any) => {
        // Use explore-specific bounds instead of defaults
        boundaryBoxRef.current = normalizeBounds(exploreBounds[city])
      },
      city,
      isMobile,
    )

    // Make map interactive and set center + min zoom (no bounds)
    mapRef.current?.on('load', () => {
      if (!mapRef.current) return
      // Remove any bounds and set min zoom + center/zoom
      try {
        mapRef.current.setMaxBounds(null as any)
      } catch (e) {}
      const minZoom = city === 'Porto' ? 13 : isMobile ? 10 : 12
      const startZoom = city === 'Porto' ? 13 : isMobile ? 11.2 : 12
      mapRef.current.setMinZoom(minZoom)
      mapRef.current.jumpTo({ center: exploreCenters[city], zoom: startZoom })

      mapRef.current.scrollZoom.enable()
      mapRef.current.boxZoom.enable()
      mapRef.current.dragRotate.disable()
      mapRef.current.keyboard.enable()
      mapRef.current.dragPan.enable()
      mapRef.current.touchZoomRotate.enable()

      // Add Mapbox zoom controls (no compass)
      try {
        mapRef.current.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          'top-right',
        )
      } catch (e) {}

      // Log current center and zoom on load
      try {
        const c = mapRef.current.getCenter()
        const z = mapRef.current.getZoom()
        // eslint-disable-next-line no-console
        console.log('Explore center/zoom (load):', { center: [c.lng, c.lat], zoom: z })
      } catch (e) {}

      // Log after each interaction-driven move
      mapRef.current.on('moveend', () => {
        try {
          const c = mapRef.current?.getCenter()
          const z = mapRef.current?.getZoom()
          if (c != null && z != null) {
            // eslint-disable-next-line no-console
            console.log('Explore center/zoom (moveend):', { center: [c.lng, c.lat], zoom: z })
          }
        } catch (e) {}
      })

      addSourcesAndLayersForBothCities(
        mapRef.current,
        citiesData,
        alPaint,
        freguesiaPaint,
        alPaintMegaHost,
        hotelsPaint,
      )

      // Show all AL points (no date filter) for both cities
      ;(['Lisbon', 'Porto'] as const).forEach(c => {
        if (mapRef.current && mapRef.current.getLayer(`${c}-al`)) {
          mapRef.current.setFilter(`${c}-al`, ['<=', ['get', 'normalized_date'], 1])
          mapRef.current.setLayoutProperty(`${c}-al`, 'visibility', c === city ? 'visible' : 'none')
          mapRef.current.setPaintProperty(`${c}-al`, 'circle-opacity', 1)
        }
      })

      // Filter features with valid centroids to avoid NaN LngLat
      const validFreguesiaData = {
        ...initialCityData.freguesiaData,
        features: initialCityData.freguesiaData.features.filter((feature: any) => {
          try {
            const c = turf.centroid(feature).geometry.coordinates
            return Number.isFinite(c?.[0]) && Number.isFinite(c?.[1])
          } catch (e) {
            return false
          }
        }),
      }

      const centroidMarkers = addCentroidMarkers(mapRef.current, validFreguesiaData, [
        'propAL',
        'diff_alojamentos_2011',
        'diff_pop_2011',
      ])
      centroidMarkersRef.current = centroidMarkers
      // Make marker contents visible by default
      updateMarkerValues(centroidMarkers, ['propAL', 'diff_alojamentos_2011', 'diff_pop_2011'])
      if (showFreguesiaMarkers) {
        setMarkerVisibility(centroidMarkers, 'block', true)
      }

      previousCityRef.current = city
    })
  }, [citiesData.isLoaded, city, isMobile])

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  // City switching (custom for Explore to avoid internal fits)
  useEffect(() => {
    if (!mapRef.current || !previousCityRef.current || previousCityRef.current === city) return

    const currentCity = previousCityRef.current
    const targetCity = city

    // Hide all layers for previous city
    const prevLayers = [
      `${currentCity}-al`,
      `${currentCity}-freguesia`,
      `${currentCity}-al-megahosts`,
      `${currentCity}-hotels`,
      `${currentCity}-freguesia-outline`,
    ]
    prevLayers.forEach(layerId => {
      if (mapRef.current?.getLayer(layerId)) {
        mapRef.current.setLayoutProperty(layerId, 'visibility', 'none')
      }
    })

    // Show AL layer for new city
    if (mapRef.current.getLayer(`${targetCity}-al`)) {
      mapRef.current.setLayoutProperty(`${targetCity}-al`, 'visibility', 'visible')
    }

    // Remove any bounds and center with min zoom
    try {
      mapRef.current.setMaxBounds(null as any)
    } catch (e) {}
    const minZoom = targetCity === 'Porto' ? 13 : isMobile ? 10 : 12
    const targetZoom = targetCity === 'Porto' ? 13 : isMobile ? 11.2 : 12
    mapRef.current.setMinZoom(minZoom)
    mapRef.current.easeTo({ center: exploreCenters[targetCity], zoom: targetZoom, duration: 300 })

    // Rebuild centroid markers for new city
    centroidMarkersRef.current.forEach(m => m.remove && m.remove())
    const newData = citiesData[city]
    if (newData?.freguesiaData) {
      const validFreguesiaData = {
        ...newData.freguesiaData,
        features: newData.freguesiaData.features.filter((feature: any) => {
          try {
            const c = turf.centroid(feature).geometry.coordinates
            return Number.isFinite(c?.[0]) && Number.isFinite(c?.[1])
          } catch (e) {
            return false
          }
        }),
      }

      const markers = addCentroidMarkers(mapRef.current, validFreguesiaData, [
        'propAL',
        'diff_alojamentos_2011',
        'diff_pop_2011',
      ])
      centroidMarkersRef.current = markers
      // Respect current toggles
      updateMarkerValues(markers, ['propAL', 'diff_alojamentos_2011', 'diff_pop_2011'])
      setMarkerVisibility(markers, showFreguesiaMarkers ? 'block' : 'none')
    }

    // Sync layer visibilities to toggles
    mapRef.current.setLayoutProperty(
      `${city}-al-megahosts`,
      'visibility',
      showMegahostColors ? 'visible' : 'none',
    )
    mapRef.current.setLayoutProperty(
      `${city}-hotels`,
      'visibility',
      showHotels ? 'visible' : 'none',
    )
    // Ensure AL layer shows all points for the newly selected city
    if (mapRef.current.getLayer(`${city}-al`)) {
      mapRef.current.setFilter(`${city}-al`, ['<=', ['get', 'normalized_date'], 1])
      mapRef.current.setPaintProperty(`${city}-al`, 'circle-opacity', 1)
    }

    previousCityRef.current = city
  }, [city])

  // Toggle handlers
  useEffect(() => {
    if (!mapRef.current) return
    // Ensure marker cells are visible when toggled on
    if (showFreguesiaMarkers) {
      updateMarkerValues(centroidMarkersRef.current, [
        'propAL',
        'diff_alojamentos_2011',
        'diff_pop_2011',
      ])
    }
    setMarkerVisibility(centroidMarkersRef.current, showFreguesiaMarkers ? 'block' : 'none')

    // Show/hide freguesia layer and outline when markers are toggled
    if (mapRef.current.getLayer(`${city}-freguesia`)) {
      mapRef.current.setLayoutProperty(
        `${city}-freguesia`,
        'visibility',
        showFreguesiaMarkers ? 'visible' : 'none',
      )
    }
    if (mapRef.current.getLayer(`${city}-freguesia-outline`)) {
      mapRef.current.setLayoutProperty(
        `${city}-freguesia-outline`,
        'visibility',
        showFreguesiaMarkers ? 'visible' : 'none',
      )
      // Update outline style to be thinner and dark blue
      if (showFreguesiaMarkers) {
        mapRef.current.setPaintProperty(`${city}-freguesia-outline`, 'line-color', '#012169')
        mapRef.current.setPaintProperty(`${city}-freguesia-outline`, 'line-width', 0.8)
      }
    }
  }, [showFreguesiaMarkers, city])

  useEffect(() => {
    if (!mapRef.current) return
    const targetCity = city
    if (mapRef.current.getLayer(`${targetCity}-al-megahosts`)) {
      mapRef.current.setLayoutProperty(
        `${targetCity}-al-megahosts`,
        'visibility',
        showMegahostColors ? 'visible' : 'none',
      )
      // Cross-fade opacity for nicer UX
      mapRef.current.setPaintProperty(
        `${targetCity}-al-megahosts`,
        'circle-opacity',
        showMegahostColors ? 1 : 0,
      )
    }
  }, [showMegahostColors, city])

  useEffect(() => {
    if (!mapRef.current) return
    const targetCity = city
    if (mapRef.current.getLayer(`${targetCity}-hotels`)) {
      mapRef.current.setLayoutProperty(
        `${targetCity}-hotels`,
        'visibility',
        showHotels ? 'visible' : 'none',
      )
    }
  }, [showHotels, city])

  return (
    <>
      <div className="explore-wrapper">
        <div ref={mapContainer} className="map-container explore-fullscreen" />

        <div
          className={`explore-controls ${isMobile ? 'is-mobile' : ''} ${
            controlsOpen ? 'is-open' : ''
          }`}>
          {isMobile && (
            <button
              type="button"
              className={`controls-toggle glassy`}
              aria-expanded={controlsOpen}
              aria-controls="explore-controls-panel"
              onClick={() => setControlsOpen(v => !v)}>
              {language === 'pt'
                ? controlsOpen
                  ? 'Esconder filtros'
                  : 'Mostrar filtros'
                : controlsOpen
                ? 'Hide controls'
                : 'Show controls'}
            </button>
          )}

          <div
            id="explore-controls-panel"
            className={`explore-controls-panel explore-filters glassy ${
              controlsOpen ? 'is-open' : ''
            }`}>
            <a href="/" className="explore-logo" title="Voltar à página principal">
              <span className="explore-back-arrow">←</span>
              <Image src={logoImage} alt="Desalojamento" height={40} layout="intrinsic" priority />
            </a>
            <div className="toggle-switch" onClick={() => setShowFreguesiaMarkers(v => !v)}>
              <span className="toggle-switch__label">
                <div className="toggle-icon toggle-icon--marker">AL</div>
                {translation('explore-toggle-1', language, city)}
              </span>
              <div className={`toggle-switch__track ${showFreguesiaMarkers ? 'is-active' : ''}`}>
                <div className="toggle-switch__thumb"></div>
              </div>
            </div>
            <div className="toggle-switch" onClick={() => setShowMegahostColors(v => !v)}>
              <span className="toggle-switch__label">
                <div className="toggle-icon toggle-icon--megahost"></div>
                {translation('explore-toggle-2', language, city)}
              </span>
              <div className={`toggle-switch__track ${showMegahostColors ? 'is-active' : ''}`}>
                <div className="toggle-switch__thumb"></div>
              </div>
            </div>
            <div className="toggle-switch" onClick={() => setShowHotels(v => !v)}>
              <span className="toggle-switch__label">
                <div className="toggle-icon toggle-icon--hotel"></div>
                {translation('explore-toggle-3', language, city)}
              </span>
              <div className={`toggle-switch__track ${showHotels ? 'is-active' : ''}`}>
                <div className="toggle-switch__thumb"></div>
              </div>
            </div>
            {isMobile && <CitySwitcher city={city} setCity={setCity} />}
          </div>

          {!isMobile && <CitySwitcher city={city} setCity={setCity} />}
        </div>
      </div>
    </>
  )
}

export default Explore
