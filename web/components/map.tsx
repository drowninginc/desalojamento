import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import Casas from './casas'
import Linechart from './linechart'
import { getTranslationString } from '../libs/translation'

import anuncioImage from './images/airbnb/anuncio.jpeg'
import paginaImage from './images/airbnb/descricaoPagina.png'
import outdoorImage from './images/airbnb/outdoor.png'

const airbnbData = {
  missingLicense: {
    Porto: 14,
    Lisbon: 15,
  },
}

const megahostsData = {
  supermegahost: {
    Porto: 48,
    Lisbon: 42,
  },
  megahosts: {
    Porto: 72,
    Lisbon: 67,
  },
  companies: {
    Porto: 60,
    Lisbon: 51,
  },
}

import {
  cityDefinitions,
  alPaint,
  alPaintMegaHost,
  freguesiaPaint,
  hotelsPaint,
} from './extras/mapStyles'

import {
  getBothCitiesData,
  getMinMax,
  createMap,
  addSourcesAndLayersForBothCities,
  addCentroidMarkers,
  switchCity,
} from './extras/helpers'

import { createScrollTriggers } from './extras/triggers'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1Ijoiam9hb2Jlcm5hcmNpc28iLCJhIjoiY2xlNjFmdWo5MDFnZTNvcHBoZmtwa2gyMSJ9.yDJ6Z-4Ig2XJC4IK4CJ4MQ'

type Props = {
  city: string
  language: string
  regulationRef: React.RefObject<HTMLDivElement>
  onMapLoad?: (isLoaded: boolean) => void
}

const Map = ({ language, city, regulationRef, onMapLoad }: Props) => {
  const citiesData = getBothCitiesData()
  const divTrigger = React.useRef(null!)
  const mapPin = React.useRef(null!)
  const mapContainer = React.useRef(null!)
  const progressBar = React.useRef(null!)
  const alCount = React.useRef(null!)
  const [isMobile, setIsMobile] = React.useState(false)

  const map = useRef<mapboxgl.Map | null>(null)
  const centroidMarkersRef = useRef<any[]>([])
  const previousCityRef = useRef<string | null>(null)
  const isMapInitialized = useRef(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const actionIntro = React.useRef(null!)
  const actionFreguesia = React.useRef(null!)
  const actionFreguesiaZoom = React.useRef(null!)
  const actionFreguesiaPop = React.useRef(null!)
  const actionFreguesiaAL = React.useRef(null!)
  const actionLineChart = React.useRef(null!)
  const actionRooms = React.useRef(null!)
  const actionMegaHosts = React.useRef(null!)
  const actionFullAirbnb = React.useRef(null!)
  const actionMap3 = React.useRef(null!)

  const imageWrappers = [useRef(null), useRef(null), useRef(null)]

  const [normalizedDate, setNormalizedDate] = React.useState(0)
  const [barWidth, setBarWidth] = React.useState('0%')
  const [triggerAnimation, setTriggerAnimation] = React.useState(false)
  const [triggerMegaHostAnimation, setTriggerMegaHostAnimation] = React.useState(false)

  const [boundaryBox, setBoundaryBox] = React.useState<[number, number][]>([])
  const [showTooltip, setShowTooltip] = React.useState(false)
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 })
  const [currentTooltipKey, setCurrentTooltipKey] = React.useState('tooltip-content')
  const [isLoadingMarkers, setIsLoadingMarkers] = React.useState(false)
  const monthsTotalRef = useRef<number>(132)
  const map2ContainerRef = useRef<HTMLDivElement>(null)

  // Set isMobile state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
  }, [])

  const formatDate = value => {
    const startDate = new Date('2014-01-01')
    const endDate = new Date('2025-08-31')
    const timeRange = endDate.valueOf() - startDate.valueOf()
    const date = new Date(startDate.getTime() + value * timeRange)

    if (language === 'en') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    } else {
      // Portuguese format without "de" between month and year
      const month = date.toLocaleDateString('pt-PT', { month: 'long' })
      const year = date.getFullYear()
      return `${month} ${year}`
    }
  }

  const getMonthlyCount = value => {
    const currentCityData = citiesData[city]?.monthlyCountsData
    if (!currentCityData) return 0

    const startDate = new Date('2014-01-01')
    const endDate = new Date('2025-08-31')
    const timeRange = endDate.valueOf() - startDate.valueOf()
    const date = new Date(startDate.getTime() + value * timeRange)

    const yearMonth = date.toISOString().slice(0, 7) // Format date to "YYYY-MM"
    return currentCityData[yearMonth] || 0 // Get the count or default to 0
  }

  gsap.registerPlugin(ScrollTrigger)

  const lastFilterValueRef = useRef<number>(-1)
  const rafIdRef = useRef<number | null>(null)

  const debouncedSetFilter = useCallback(
    (mapInstance, dateValue, currentCity) => {
      // Quantize to monthly steps to avoid excessive filter churn while staying smooth
      const totalMonths = Math.max(1, monthsTotalRef.current)
      const steps = Math.max(1, totalMonths - 1)
      const rounded = Math.max(0, Math.min(1, Math.round(dateValue * steps) / steps))

      if (rounded === lastFilterValueRef.current) return
      lastFilterValueRef.current = rounded

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (mapInstance && mapInstance.getLayer(`${currentCity}-al`)) {
          mapInstance.setFilter(`${currentCity}-al`, ['<=', ['get', 'normalized_date'], rounded])
        }
        rafIdRef.current = null
      })
    },
    [city],
  )

  // Cleanup any pending rAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  // Derive total months from loaded data for current city (fallback to date math)
  useEffect(() => {
    const currentCityData = citiesData[city]?.monthlyCountsData
    if (currentCityData) {
      const keys = Object.keys(currentCityData)
      if (keys.length > 0) {
        monthsTotalRef.current = keys.length
        return
      }
    }
    // Fallback using the same date domain used elsewhere
    const startDate = new Date('2014-01-01')
    const endDate = new Date('2025-08-31')
    const monthsDiff =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1
    monthsTotalRef.current = Math.max(1, monthsDiff)
  }, [citiesData.isLoaded, city])

  // Initialize map only once when all data is loaded
  useEffect(() => {
    const checkMapLoaded = () => {
      if (map.current && map.current.loaded()) {
        document.body.style.overflow = 'scroll'
      } else {
        document.body.style.overflow = 'hidden'
        setTimeout(checkMapLoaded, 400)
      }
    }

    if (!citiesData.isLoaded || isMapInitialized.current) {
      return
    }

    console.log('Initializing map with both cities data')

    // Reset state
    setNormalizedDate(0)
    setBarWidth('0%')
    setTriggerAnimation(false)
    setTriggerMegaHostAnimation(false)
    setBoundaryBox([])
    lastFilterValueRef.current = -1

    // Clear map container
    if (mapContainer.current) {
      mapContainer.current.innerHTML = ''
    }

    // Get freguesia data for initial city to calculate paint properties
    const initialCityData = citiesData[city]
    const freguesiaData = initialCityData.freguesiaData

    if (freguesiaData) {
      const [minPop, maxPop] = getMinMax(freguesiaData, 'diff_pop_2011')
      const [minAloj, maxAloj] = getMinMax(freguesiaData, 'diff_alojamentos_2011')

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

      map.current = createMap(mapContainer.current, cityDefinitions, setBoundaryBox, city, isMobile)

      map.current.on('load', () => {
        console.log('Map loaded successfully')
        onMapLoad?.(true)

        // Add sources and layers for both cities
        addSourcesAndLayersForBothCities(
          map.current,
          citiesData,
          alPaint,
          freguesiaPaint,
          alPaintMegaHost,
          hotelsPaint,
        )

        // Add centroid markers for current city
        const centroidMarkers = addCentroidMarkers(map.current, freguesiaData, [
          'propAL',
          'diff_alojamentos_2011',
          'diff_pop_2011',
        ])

        centroidMarkersRef.current = centroidMarkers

        // Create scroll triggers
        createScrollTriggers(
          isMobile,
          city,
          map,
          divTrigger,
          mapPin,
          progressBar,
          actionIntro,
          actionFreguesia,
          actionFreguesiaZoom,
          actionFreguesiaPop,
          actionFreguesiaAL,
          actionLineChart,
          actionRooms,
          actionMegaHosts,
          actionFullAirbnb,
          actionMap3,
          setNormalizedDate,
          setBarWidth,
          debouncedSetFilter,
          freguesiaPaintPop,
          freguesiaPaintAL,
          centroidMarkers,
          setTriggerAnimation,
          setBoundaryBox,
          setTriggerMegaHostAnimation,
          imageWrappers,
          regulationRef,
        )

        isMapInitialized.current = true
        previousCityRef.current = city
      })

      checkMapLoaded()
    }
  }, [citiesData.isLoaded, isMobile])

  // Handle city changes without recreating the map
  useEffect(() => {
    if (!isMapInitialized.current || !map.current || previousCityRef.current === city) {
      return
    }

    console.log(`Switching from ${previousCityRef.current} to ${city}`)

    // Clean up previous markers
    centroidMarkersRef.current.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove()
      }
    })

    // Switch city layers and camera
    switchCity(
      map.current,
      city,
      previousCityRef.current,
      cityDefinitions,
      setBoundaryBox,
      isMobile,
    )

    // Show loading state for markers
    setIsLoadingMarkers(true)
    // Reset filter scheduler cache for new city
    lastFilterValueRef.current = -1

    // OPTIMIZATION: Defer marker creation and ScrollTrigger recreation to avoid blocking the map animation
    // This ensures the map fly-to animation remains smooth and responsive, even when many markers need to be created
    // The 350ms delay allows the map animation (300ms) to complete before starting expensive DOM operations
    setTimeout(() => {
      // Add markers for new city
      const newCityData = citiesData[city]
      if (newCityData.freguesiaData) {
        const centroidMarkers = addCentroidMarkers(map.current, newCityData.freguesiaData, [
          'propAL',
          'diff_alojamentos_2011',
          'diff_pop_2011',
        ])
        centroidMarkersRef.current = centroidMarkers

        // Update scroll triggers for new city
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())

        const [minPop, maxPop] = getMinMax(newCityData.freguesiaData, 'diff_pop_2011')
        const [minAloj, maxAloj] = getMinMax(newCityData.freguesiaData, 'diff_alojamentos_2011')

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

        createScrollTriggers(
          isMobile,
          city,
          map,
          divTrigger,
          mapPin,
          progressBar,
          actionIntro,
          actionFreguesia,
          actionFreguesiaZoom,
          actionFreguesiaPop,
          actionFreguesiaAL,
          actionLineChart,
          actionRooms,
          actionMegaHosts,
          actionFullAirbnb,
          actionMap3,
          setNormalizedDate,
          setBarWidth,
          debouncedSetFilter,
          freguesiaPaintPop,
          freguesiaPaintAL,
          centroidMarkers,
          setTriggerAnimation,
          setBoundaryBox,
          setTriggerMegaHostAnimation,
          imageWrappers,
          regulationRef,
        )
      }

      // Hide loading state
      setIsLoadingMarkers(false)
    }, 350) // Wait for map animation to complete (300ms + 50ms buffer)

    previousCityRef.current = city
  }, [city, citiesData, isMobile])

  const useResize = handler => {
    useEffect(() => {
      window.addEventListener('resize', handler)

      return () => {
        window.removeEventListener('resize', handler)
      }
    }, [handler])
  }

  const onResize = useCallback(() => {
    if (map.current) {
      map.current.resize()
      setTimeout(() => {
        map.current.resize()
        map.current.fitBounds([
          [boundaryBox[0][0], boundaryBox[0][1]],
          [boundaryBox[1][0], boundaryBox[1][1]],
        ])
      }, 500) // Ensure fitBounds is called after resize
    }
  }, [map.current, boundaryBox])

  useResize(onResize)

  // Add event listeners to map2 span after content is rendered
  useEffect(() => {
    if (map2ContainerRef.current) {
      const span = map2ContainerRef.current.querySelector('span')
      if (span && !span.classList.contains('processed')) {
        // Get the original text content before any modifications
        const originalText = 'oferta de AL'

        // Clear any existing content and recreate the structure
        span.innerHTML = ''

        // Create text node
        const textNode = document.createTextNode(originalText)
        span.appendChild(textNode)

        // Add question mark SVG icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        svg.setAttribute('width', '16')
        svg.setAttribute('height', '16')
        svg.setAttribute('viewBox', '0 0 16 16')
        svg.setAttribute('fill', 'none')
        svg.style.marginLeft = '6px'

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', '8')
        circle.setAttribute('cy', '8')
        circle.setAttribute('r', '7')
        circle.setAttribute('stroke', '#888')
        circle.setAttribute('stroke-width', '1.5')
        circle.setAttribute('fill', '#fff')

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', '8')
        text.setAttribute('y', '11')
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('font-size', '10')
        text.setAttribute('fill', '#888')
        text.setAttribute('font-family', 'Arial')
        text.setAttribute('font-weight', 'bold')
        text.textContent = '?'

        svg.appendChild(circle)
        svg.appendChild(text)
        span.appendChild(svg)

        // Apply the same styling as the existing hover-tooltip
        span.style.cursor = 'help'
        span.style.borderBottom = '1px dashed #888'
        span.style.textDecoration = 'none'
        span.style.display = 'inline-flex'
        span.style.alignItems = 'center'

        span.onmouseenter = e => handleMouseEnter(e as any, 'tooltip-map2-span')
        span.onmouseleave = handleMouseLeave

        // Mark as processed to prevent double processing
        span.classList.add('processed')
      }
    }
  }, [language, city]) // Re-run when language or city changes

  // Tooltip handlers
  const handleMouseEnter = (event: React.MouseEvent, tooltipKey = 'tooltip-content') => {
    const rect = event.currentTarget.getBoundingClientRect()

    // Get tooltip height, fallback to 30 if not available
    const tooltipHeight = tooltipRef.current?.offsetHeight || 30

    setTooltipPosition({
      x: rect.left / 2,
      y: rect.top - tooltipHeight,
    })
    setCurrentTooltipKey(tooltipKey)
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())

      // Clean up markers
      centroidMarkersRef.current.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove()
        }
      })
      centroidMarkersRef.current = []

      // Clean up map
      if (map.current) {
        map.current.remove()
        map.current = null
      }
      isMapInitialized.current = false
    }
  }, [])

  return (
    <>
      <div
        ref={tooltipRef}
        className={`tooltip ${showTooltip ? 'visible' : ''}`}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
        }}
        dangerouslySetInnerHTML={{
          __html: getTranslationString(currentTooltipKey, language, city),
        }}></div>
      <div className="whole-container">
        <div ref={progressBar} className="progress-bar">
          <div className="progress-fill" style={{ width: barWidth }}>
            <div className="progress-fill-text" style={{ width: barWidth }}>
              {formatDate(normalizedDate)}
            </div>
          </div>
          {formatDate(normalizedDate)}
        </div>
        <div ref={alCount} className="al-count">
          {getMonthlyCount(normalizedDate) + ' ALs'}
        </div>
        {isLoadingMarkers && (
          <div className="markers-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div className="plot-full-screen"></div>

        <div ref={mapPin} className="map-content">
          <div ref={mapContainer} className="map-container" />
        </div>
        <div ref={divTrigger} className="text-boxes-container">
          <div className="text-box glassy">
            <h2>{getTranslationString('map1-revised-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('map1-revised', language, city),
              }}
            />
          </div>
          <div className="text-box glassy">
            <h2>{getTranslationString('map2-revised-title', language, city)}</h2>
            <div
              ref={map2ContainerRef}
              dangerouslySetInnerHTML={{
                __html: getTranslationString('map2-revised', language, city),
              }}
            />
            <div className="text-box-note">
              <div className="text-box-note-text">
                {getTranslationString('map2-note', language, city)}
              </div>
              <svg className="circle-legend-svg" width="22.66" height="21.66">
                <circle className="circleBig" cx="11.33" cy="11.33" r="10.33" />
                <circle className="circleSmall" cx="11.33" cy="16" r="5" />
              </svg>
            </div>
          </div>
          <div className="text-box glassy" ref={actionMap3}>
            <h2>{getTranslationString('map3-revised-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('map3-revised', language, city),
              }}
            />
          </div>
          <div className="text-box glassy">
            <h2>{getTranslationString('map4-revised-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('map4-revised', language, city),
              }}
            />
          </div>
          <div className="text-box glassy">
            <h2>{getTranslationString('map5-revised-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('map5-revised', language, city),
              }}
            />
          </div>
          <div className="text-box glassy">
            <h2>{getTranslationString('map6-revised-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('map6-revised', language, city),
              }}
            />
          </div>
          <div className="text-box glassy">
            <h2>{getTranslationString('map7-revised-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('map7-revised', language, city),
              }}
            />
          </div>

          <div ref={actionIntro} className="text-box glassy">
            <h2>{getTranslationString('actionIntro-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('actionIntro', language, city),
              }}
            />
            <div className="text-box-note text-box-note-megahosts">
              <div className="text-box-note-text">
                {getTranslationString('actionIntro-note', language, city)}
              </div>
              <div className="toggle-icon toggle-icon--hotel"></div>
            </div>
          </div>

          <div ref={actionFreguesia} className="text-box glassy">
            <h2>{getTranslationString('actionFreguesia-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('actionFreguesia', language, city),
              }}
            />
            <div className="heatmap-label">
              <span className="label-center">
                <span
                  className="hover-tooltip"
                  id="hover_1"
                  onMouseEnter={e => handleMouseEnter(e, 'tooltip-content')}
                  onMouseLeave={handleMouseLeave}
                  style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  {getTranslationString('actionFreguesia-label', language, city)}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ marginLeft: '6px' }}>
                    <circle cx="8" cy="8" r="7" stroke="#888" strokeWidth="1.5" fill="#fff" />
                    <text
                      x="8"
                      y="11"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#888"
                      fontFamily="Arial"
                      fontWeight="bold">
                      ?
                    </text>
                  </svg>
                </span>
              </span>

              <div className="heatmap-rectangle heatmap-al"></div>
              <div className="heatmap-labels">
                <span className="label-left">
                  {getTranslationString('actionFreguesia-label-left', language, city)}
                </span>
                <span className="label-right">
                  {getTranslationString('actionFreguesia-label-right', language, city)}
                </span>
              </div>
            </div>
            <div className="text-box-note">
              <div className="text-box-note-text">
                {getTranslationString('map7-revised-note', language, city)}
              </div>
            </div>
          </div>
          <div ref={actionFreguesiaZoom} className="text-box glassy">
            {getTranslationString('actionFreguesia-zoom', language, city)}
          </div>
          <div ref={actionFreguesiaAL} className="text-box glassy">
            <h2>{getTranslationString('actionFreguesiaAL-title', language, city)}</h2>
            {getTranslationString('actionFreguesiaAL', language, city)}

            <div className="heatmap-label">
              <span className="label-center">
                {getTranslationString('actionFreguesiaAl-label', language, city)}
              </span>
              <div className="heatmap-rectangle heatmap-population">
                <div className="category category-1"></div>
                <div className="category category-2"></div>
                <div className="category category-3"></div>
                <div className="category category-4"></div>
              </div>
              <div className="heatmap-labels">
                <span className="label-left">
                  {getTranslationString('actionFreguesiaAl-label-left', language, city)}
                </span>
                <span className="label-right">
                  {getTranslationString('actionFreguesiaAl-label-right', language, city)}
                </span>
              </div>
            </div>
          </div>
          <div ref={actionFreguesiaPop} className="text-box glassy">
            <h2>{getTranslationString('actionFreguesiaPop-title', language, city)}</h2>
            {getTranslationString('actionFreguesiaPop', language, city)}
            <div className="heatmap-label">
              <span className="label-center">
                {getTranslationString('actionFreguesiaPop-label', language, city)}
              </span>
              <div className="heatmap-rectangle heatmap-population"></div>
              <div className="heatmap-labels">
                <span className="label-left">
                  {getTranslationString('actionFreguesiaPop-label-left', language, city)}
                </span>
                <span className="label-right">
                  {getTranslationString('actionFreguesiaPop-label-right', language, city)}
                </span>
              </div>
            </div>
          </div>
          <div ref={actionLineChart} className="text-box glassy">
            <h2>{getTranslationString('actionLineChart-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('actionLineChart', language, city),
              }}></div>
            <Linechart
              language={language}
              city={city}
              triggerAnimation={triggerAnimation}></Linechart>
          </div>

          <div className="full-text-box" ref={actionFullAirbnb}>
            <div className="full-text-title">
              {' '}
              {getTranslationString('airbnbAds-title', language, city)}
            </div>
            <div className="content-wrapper">
              <div className="text-container">
                <p className="timeline-order-first">
                  {getTranslationString('airbnbAds-intro', language, city)}
                </p>
                <h2 className="timeline-order-final ">
                  {getTranslationString('airbnbAds-conclusion', language, city)}
                </h2>
              </div>
              <div className="images-container">
                <div className="image-wrapper" ref={imageWrappers[0]}>
                  <Image
                    src={paginaImage}
                    alt="Anuncio"
                    layout="responsive"
                    width={500}
                    height={300}
                  />
                </div>
                <div className="image-wrapper" ref={imageWrappers[1]}>
                  <Image
                    src={anuncioImage}
                    alt="Pagina"
                    layout="responsive"
                    width={500}
                    height={300}
                  />
                </div>
                <div className="image-wrapper" ref={imageWrappers[2]}>
                  <Image
                    src={outdoorImage}
                    alt="Outdoor"
                    layout="responsive"
                    width={500}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
          <div ref={actionRooms} className="text-box glassy">
            <h2
              dangerouslySetInnerHTML={{
                __html: getTranslationString('actionRooms-title', language, city),
              }}
            />
            {getTranslationString('actionRooms', language, city)}
          </div>
          <div ref={actionMegaHosts} className="text-box glassy">
            <h2>{getTranslationString('actionMegaHosts-title', language, city)}</h2>

            <Casas
              key={`megahosts-${city}`}
              percentage={megahostsData.megahosts[city]}
              title={getTranslationString('actionMegaHosts-label-1', language, city) as string}
              triggerAnimation={triggerMegaHostAnimation}></Casas>

            <Casas
              key={`companies-${city}`}
              percentage={megahostsData.companies[city]}
              title={getTranslationString('actionMegaHosts-label-2', language, city) as string}
              triggerAnimation={triggerMegaHostAnimation}></Casas>

            <div className="text-box-note text-box-note-megahosts">
              <div className="text-box-note-text">
                {getTranslationString('megahosts-label-1', language, city)}
              </div>
              <div className="toggle-icon toggle-icon--megahost"></div>
            </div>
            <div className="text-box-note text-box-note-megahosts">
              <div className="text-box-note-text">
                {getTranslationString('megahosts-label-2', language, city)}
              </div>
              <div className="toggle-icon toggle-icon--gigahost"></div>
            </div>
          </div>
          <div className="text-box glassy">
            <h2>{getTranslationString('period-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('period-text', language, city),
              }}></div>
          </div>
          <div className="text-box glassy">
            <h2>{getTranslationString('airbnb-title', language, city)}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: getTranslationString('airbnb-text', language, city),
              }}></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Map
