import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { debounce } from 'lodash'
import {
  cityDefinitions,
  alPaint,
  alPaintMegaHost,
  freguesiaPaint,
  seccaoPaint,
} from './extras/mapStyles'
import { getCityData, getMinMax } from './extras/helpers'
import { createScrollTriggers } from './extras/triggers'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2xhdWRpb2xlbW9zIiwiYSI6ImNsMDV4NXBxajBzMWkzYm9ndXhzbTk5ZHkifQ.85n9mjZbTDUpyQZrrJTBwA'

type Props = {
  city: string
}

const Map = ({ city }: Props) => {
  const { alData, freguesiaData, seccaoData } = getCityData(city)

  const divTrigger = React.useRef(null!)
  const mapPin = React.useRef(null!)
  const mapContainer = React.useRef(null!)
  const progressBar = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

  const actionIntro = React.useRef(null!)
  const actionFreguesia = React.useRef(null!)
  const actionFreguesiaPop = React.useRef(null!)
  const actionFreguesiaAL = React.useRef(null!)
  const actionSeccao = React.useRef(null!)
  const actionMegaHosts = React.useRef(null!)

  const [normalizedDate, setNormalizedDate] = React.useState(0)
  const [barWidth, setBarWidth] = React.useState('0%')

  const formatDate = value => {
    const startDate = new Date('2014-01-01')
    const endDate = new Date('2023-11-15')
    const timeRange = endDate.valueOf() - startDate.valueOf()
    const date = new Date(startDate.getTime() + value * timeRange)
    return date.toLocaleDateString('pt-pt', { year: 'numeric', month: 'long' })
  }

  gsap.registerPlugin(ScrollTrigger)

  const debouncedSetFilter = debounce((map, dateValue) => {
    map.setFilter('porto-al', ['<=', ['get', 'normalized_date'], dateValue])
  }, 15)

  useEffect(() => {
    console.log(freguesiaData)
    document.body.style.overflow = !map.current
      ? 'hidden'
      : map.current.loaded()
      ? 'scroll'
      : 'hidden'

    if (alData && freguesiaData && seccaoData) {
      if (map.current) return

      const [minPop, maxPop] = getMinMax(freguesiaData, 'diff_pop_2011')
      const freguesiaPaintPop: mapboxgl.FillPaint = {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'diff_pop_2011'],
          minPop,
          '#8B0000',
          maxPop,
          '#FFA07A',
        ],
        'fill-opacity': 1,
        'fill-color-transition': { duration: 500 },
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: cityDefinitions[city].mapCenter,
        zoom: cityDefinitions[city].zoom,
        interactive: false,
      })

      map.current.on('load', () => {
        document.body.style.overflow = 'scroll'

        createScrollTriggers(
          map,
          divTrigger,
          mapPin,
          progressBar,
          actionIntro,
          actionFreguesia,
          actionFreguesiaPop,
          actionFreguesiaAL,
          actionSeccao,
          actionMegaHosts,
          setNormalizedDate,
          setBarWidth,
          debouncedSetFilter,
          freguesiaPaintPop,
        )

        // MAPBOX SOURCES
        map.current?.addSource('porto-al', {
          type: 'geojson',
          data: alData,
        })

        map.current?.addSource('porto-freguesia', {
          type: 'geojson',
          data: freguesiaData,
        })

        map.current?.addSource('porto-seccao', {
          type: 'geojson',
          data: seccaoData,
        })

        // MAPBOX LAYERS

        // Map 1
        map.current?.addLayer({
          id: 'porto-al',
          type: 'circle',
          source: 'porto-al',
          paint: alPaint,
          filter: ['<=', ['get', 'normalized_date'], 0],
        })

        // Map 2
        map.current?.addLayer({
          id: 'porto-freguesia',
          type: 'fill',
          source: 'porto-freguesia',
          layout: {
            visibility: 'none',
          },
          paint: freguesiaPaint,
        })

        map.current?.addLayer({
          id: 'porto-freguesia-outline',
          type: 'line',
          source: 'porto-freguesia',
          layout: {
            visibility: 'none',
          },
          paint: {
            'line-color': '#007cbf',
            'line-width': 1,
          },
        })

        // Map 3
        map.current?.addLayer({
          id: 'porto-seccao',
          type: 'fill',
          source: 'porto-seccao',
          layout: {
            visibility: 'none',
          },
          paint: seccaoPaint,
        })

        // Map 4
        map.current?.addLayer({
          id: 'porto-al-megahosts',
          type: 'circle',
          source: 'porto-al',
          layout: {
            visibility: 'none',
          },
          paint: alPaintMegaHost,
        })
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [alData])

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

        <div className="plot-full-screen"></div>

        <div ref={mapPin} className="map-content">
          <div ref={mapContainer} className="map-container" />
        </div>

        <div ref={divTrigger} className="text-boxes-container">
          <div className="text-box">
            A figura do alojamento local foi introduzido em 2008, mas só em 2014 passou o seu
            registo a ser obrigatório, passando os alojamentos deste tipo que já operavam antes a
            estar integrados nesta designação.
          </div>
          <div className="text-box">
            A figura do alojamento local foi introduzido em 2008, mas só em 2014 passou o seu
            registo a ser obrigatório, passando os alojamentos deste tipo que já operavam antes a
            estar integrados nesta designação.
          </div>
          <div className="text-box">
            A figura do alojamento local foi introduzido em 2008, mas só em 2014 passou o seu
            registo a ser obrigatório, passando os alojamentos deste tipo que já operavam antes a
            estar integrados nesta designação.
          </div>
          <div className="text-box">
            A figura do alojamento local foi introduzido em 2008, mas só em 2014 passou o seu
            registo a ser obrigatório, passando os alojamentos deste tipo que já operavam antes a
            estar integrados nesta designação.
          </div>
          <div ref={actionIntro} className="text-box">
            actionIntro
          </div>
          <div ref={actionFreguesia} className="text-box">
            actionFreguesia
          </div>
          <div ref={actionFreguesiaPop} className="text-box">
            actionFreguesiaPop
          </div>
          <div ref={actionFreguesiaAL} className="text-box">
            actionFreguesiaAL
          </div>
          <div ref={actionSeccao} className="text-box">
            actionSeccao
          </div>
          <div ref={actionMegaHosts} className="text-box">
            actionMegaHosts
          </div>
        </div>
      </div>
    </>
  )
}

export default Map
