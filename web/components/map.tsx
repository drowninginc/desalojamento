import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { debounce } from 'lodash'
import Casas from './casas'
import Linechart from './linechart'
import translation, { getTranslationString } from '../libs/translation'

import anuncioImage from './images/airbnb/anuncio.jpeg'
import paginaImage from './images/airbnb/descricaoPagina.png'
import outdoorImage from './images/airbnb/outdoor.png'

const megahostsData = {
  megahosts: {
    Porto: 72,
    Lisbon: 68,
  },
  companies: {
    Porto: 60,
    Lisbon: 50,
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
  getCityData,
  getMinMax,
  createMap,
  addSourcesAndLayers,
  addCentroidMarkers,
} from './extras/helpers'
import { createScrollTriggers } from './extras/triggers'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1Ijoiam9hb2Jlcm5hcmNpc28iLCJhIjoiY2xlNjFmdWo5MDFnZTNvcHBoZmtwa2gyMSJ9.yDJ6Z-4Ig2XJC4IK4CJ4MQ'

type Props = {
  city: string
  language: string
}

const Map = ({ language, city }: Props) => {
  const { alData, freguesiaData, monthlyCountsData, hotelsData } = getCityData(city)
  const divTrigger = React.useRef(null!)
  const mapPin = React.useRef(null!)
  const mapContainer = React.useRef(null!)
  const progressBar = React.useRef(null!)
  const alCount = React.useRef(null!)

  const map = useRef<mapboxgl.Map | null>(null)

  const actionIntro = React.useRef(null!)
  const actionFreguesia = React.useRef(null!)
  const actionFreguesiaZoom = React.useRef(null!)
  const actionFreguesiaPop = React.useRef(null!)
  const actionFreguesiaAL = React.useRef(null!)
  const actionLineChart = React.useRef(null!)
  const actionMegaHosts = React.useRef(null!)
  const actionFullAirbnb = React.useRef(null!)

  const imageWrappers = [useRef(null), useRef(null), useRef(null)]

  const [normalizedDate, setNormalizedDate] = React.useState(0)
  const [barWidth, setBarWidth] = React.useState('0%')
  const [triggerAnimation, setTriggerAnimation] = React.useState(false)
  const [triggerMegaHostAnimation, setTriggerMegaHostAnimation] = React.useState(false)

  const [boundaryBox, setBoundaryBox] = React.useState<[number, number][]>([])

  const formatDate = value => {
    const startDate = new Date('2014-01-01')
    const endDate = new Date('2024-12-30')
    const timeRange = endDate.valueOf() - startDate.valueOf()
    const date = new Date(startDate.getTime() + value * timeRange)
    return date.toLocaleDateString('pt-pt', { year: 'numeric', month: 'long' })
  }

  const getMonthlyCount = value => {
    if (!monthlyCountsData) return 0 // Check if monthlyCountsData exists

    const startDate = new Date('2014-01-01')
    const endDate = new Date('2024-12-30')
    const timeRange = endDate.valueOf() - startDate.valueOf()
    const date = new Date(startDate.getTime() + value * timeRange)

    const yearMonth = date.toISOString().slice(0, 7) // Format date to "YYYY-MM"
    return monthlyCountsData[yearMonth] || 0 // Get the count or default to 0
  }

  gsap.registerPlugin(ScrollTrigger)

  const debouncedSetFilter = debounce((map, dateValue) => {
    map.setFilter(`${city}-al`, ['<=', ['get', 'normalized_date'], dateValue])
  }, 10)

  useEffect(() => {
    const checkMapLoaded = () => {
      if (map.current && map.current.loaded()) {
        document.body.style.overflow = 'scroll'
      } else {
        document.body.style.overflow = 'hidden'
        setTimeout(checkMapLoaded, 400)
      }
    }

    if (!alData) {
      console.log('Missing alData')
    }
    if (!freguesiaData) {
      console.log('Missing freguesiaData')
    }
    if (!hotelsData) {
      console.log('Missing hotelsData')
    }

    if (alData && freguesiaData && hotelsData) {
      if (map.current) return

      const [minPop, maxPop] = getMinMax(freguesiaData, 'diff_pop_2011')
      const [minAloj, maxAloj] = getMinMax(freguesiaData, 'diff_alojamentos_2011')
      const freguesiaPaintPop: mapboxgl.FillPaint = {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'diff_pop_2011'],
          minPop,
          '#b3589a', // Vivid red for the most negative values
          0,
          '#FFFFFF', // White for zero
          maxPop,
          '#b8ffcb', // Green for the most positive values
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
          '#b3589a', // Vivid red for the most negative values
          0,
          '#FFFFFF', // White for zero
          maxAloj,
          '#b8ffcb', // Dark green for the most positive values
        ],
        'fill-opacity': 0.1,
        'fill-color-transition': { duration: 500 },
      }

      console.log('prewtf')

      map.current = createMap(mapContainer.current, city, cityDefinitions, setBoundaryBox)

      console.log('wtf')
      map.current.on('load', () => {
        console.log('Map loaded successfully')
        const centroidMarkers = addCentroidMarkers(map.current, freguesiaData, [
          'propAL',
          'diff_alojamentos_2011',
          'diff_pop_2011',
        ])

        createScrollTriggers(
          city,
          map,
          divTrigger,
          mapPin,
          progressBar,
          alCount,
          actionIntro,
          actionFreguesia,
          actionFreguesiaZoom,
          actionFreguesiaPop,
          actionFreguesiaAL,
          actionLineChart,
          actionMegaHosts,
          actionFullAirbnb,
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
        )

        addSourcesAndLayers(
          city,
          map.current,
          alData,
          freguesiaData,
          hotelsData,
          alPaint,
          freguesiaPaint,
          alPaintMegaHost,
          hotelsPaint,
        )
      })
    }

    checkMapLoaded()

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [alData, hotelsData])

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

  return (
    <>
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
        <div className="plot-full-screen"></div>

        <div ref={mapPin} className="map-content">
          <div ref={mapContainer} className="map-container" />
        </div>
        <div ref={divTrigger} className="text-boxes-container">
          <div className="text-box glassy">{translation('map1', language, city)}</div>
          <div className="text-box glassy">
            {translation('map2', language, city)}
            <div className="text-box-note">
              <div className="text-box-note-text">{translation('map2-note', language, city)}</div>
              <svg className="circle-legend-svg" width="22.66" height="21.66">
                <circle className="circleBig" cx="11.33" cy="11.33" r="10.33" />
                <circle className="circleSmall" cx="11.33" cy="16" r="5" />
              </svg>
            </div>
          </div>
          <div ref={actionIntro} className="text-box glassy">
            <h2>{translation('actionIntro-title', language, city)}</h2>
            {translation('actionIntro', language, city)}
          </div>
          <div ref={actionFreguesia} className="text-box glassy">
            <h2>{translation('actionFreguesia-title', language, city)}</h2>
            {translation('actionFreguesia', language, city)}
            <div className="heatmap-label">
              <span className="label-center">
                {translation('actionFreguesia-label', language, city)}
              </span>
              <div className="heatmap-rectangle heatmap-al"></div>
              <div className="heatmap-labels">
                <span className="label-left">
                  {translation('actionFreguesia-label-left', language, city)}
                </span>
                <span className="label-right">
                  {translation('actionFreguesia-label-right', language, city)}
                </span>
              </div>
            </div>
          </div>
          <div ref={actionFreguesiaZoom} className="text-box glassy">
            {translation('actionFreguesia-zoom', language, city)}
          </div>
          <div ref={actionFreguesiaAL} className="text-box glassy">
            <h2>{translation('actionFreguesiaAL-title', language, city)}</h2>
            {translation('actionFreguesiaAL', language, city)}

            <div className="heatmap-label">
              <span className="label-center">
                {translation('actionFreguesia-label', language, city)}
              </span>
              <div className="heatmap-rectangle heatmap-population">
                <div className="category category-1"></div>
                <div className="category category-2"></div>
                <div className="category category-3"></div>
                <div className="category category-4"></div>
              </div>
              <div className="heatmap-labels">
                <span className="label-left">
                  {translation('actionFreguesiaAl-label-left', language, city)}
                </span>
                <span className="label-right">
                  {translation('actionFreguesiaAl-label-right', language, city)}
                </span>
              </div>
            </div>
          </div>
          <div ref={actionFreguesiaPop} className="text-box glassy">
            <h2>{translation('actionFreguesiaPop-title', language, city)}</h2>
            {translation('actionFreguesiaPop', language, city)}
            <div className="heatmap-label">
              <span className="label-center">
                {translation('actionFreguesiaPop-label', language, city)}
              </span>
              <div className="heatmap-rectangle heatmap-population"></div>
              <div className="heatmap-labels">
                <span className="label-left">
                  {translation('actionFreguesiaPop-label-left', language, city)}
                </span>
                <span className="label-right">
                  {translation('actionFreguesiaPop-label-right', language, city)}
                </span>
              </div>
            </div>
          </div>
          <div ref={actionLineChart} className="text-box glassy">
            <h2>{translation('actionLineChart-title', language, city)}</h2>
            {translation('actionLineChart', language, city)}
            <Linechart
              language={language}
              city={city}
              triggerAnimation={triggerAnimation}></Linechart>
          </div>

          <div className="full-text-box" ref={actionFullAirbnb}>
            <div className="full-text-title"> {translation('airbnbAds-title', language, city)}</div>
            <div className="content-wrapper">
              <div className="text-container">
                <p className="timeline-order-first">
                  {translation('airbnbAds-intro', language, city)}
                </p>
                <h2 className="timeline-order-final ">
                  {translation('airbnbAds-conclusion', language, city)}
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
          <div ref={actionMegaHosts} className="text-box glassy">
            <h2>{translation('actionMegaHosts-title', language, city)}</h2>

            <Casas
              percentage={megahostsData.megahosts[city]}
              title={translation('actionMegaHosts-label-1', language, city) as string}
              triggerAnimation={triggerMegaHostAnimation}></Casas>
            <Casas
              percentage={megahostsData.companies[city]}
              title={translation('actionMegaHosts-label-2', language, city) as string}
              triggerAnimation={triggerMegaHostAnimation}></Casas>
          </div>
          <div className="text-box glassy">
            <h2
              dangerouslySetInnerHTML={{
                __html: getTranslationString('actionRooms-title', language, city),
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Map
