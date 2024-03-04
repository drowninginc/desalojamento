import useSWR from 'swr'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import fetcher from '../libs/fetcher'
import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2xhdWRpb2xlbW9zIiwiYSI6ImNsMDV4NXBxajBzMWkzYm9ndXhzbTk5ZHkifQ.85n9mjZbTDUpyQZrrJTBwA'

const useData = (path: string) => useSWR<any>(`./static/data/${path}`, fetcher)

// MAP PAINT PROPERTIES

// Map 1

const alPaint: mapboxgl.CirclePaint = {
  'circle-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    12, // minimum zoom level to start interpolation
    ['interpolate', ['linear'], ['get', 'weight'], 0, 2, 1, 6], // at zoom level 10
    16, // maximum zoom level to end interpolation
    ['interpolate', ['linear'], ['get', 'weight'], 0, 4, 1, 20], // at zoom level 15
  ],
  'circle-color': '#012169',
}

const alPaintMegaHost: mapboxgl.CirclePaint = {
  'circle-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    12, // minimum zoom level to start interpolation
    ['interpolate', ['linear'], ['get', 'weight'], 0, 2, 1, 6], // at zoom level 10
    16, // maximum zoom level to end interpolation
    ['interpolate', ['linear'], ['get', 'weight'], 0, 4, 1, 20], // at zoom level 15
  ],
  'circle-color': [
    'case',
    ['==', ['get', 'mega_host_2'], 'True'],
    '#ff1654', // Red color for mega hosts
    '#012169', // Default blue color for others
  ],
}

// Map 2

const freguesiaPaint: mapboxgl.FillPaint = {
  'fill-color': [
    // 'interpolate',
    // ['linear'],
    // ['zoom'],
    // 10,
    // '#007cbf', // blue at zoom level 12
    // 13,
    // [
    'interpolate',
    ['linear'],
    ['get', 'propAL'], // assuming 'propAL' is the property in your data
    0,
    'rgba(173, 216, 230, 0.2)', // light blue with 100% transparency for propAL = 0
    40,
    'rgba(0, 0, 139, 1)',
    50,
    'rgba(0, 0, 139, 1)',
    100,
    'rgba(0, 0, 139, 1)', // dark blue with 20% transparency for propAL = 100
  ],
  'fill-opacity': 1,
  'fill-color-transition': { duration: 500 },
}

const freguesiaPaintPop: mapboxgl.FillPaint = {
  'fill-color': [
    // 'interpolate',
    // ['linear'],
    // ['zoom'],
    // 10,
    // '#007cbf', // blue at zoom level 12
    // 13,
    // [
    'interpolate',
    ['linear'],
    ['get', 'diff_pop_2011'], // assuming 'propAL' is the property in your data
    0,
    '#FFA07A', // light blue for propAL = 0
    100,
    '#8B0000', // dark blue for propAL = 100
    // ],
  ],
  'fill-opacity': 1,
  'fill-color-transition': { duration: 500 },
}

const freguesiaPaintAL: mapboxgl.FillPaint = {
  'fill-color': [
    // 'interpolate',
    // ['linear'],
    // ['zoom'],
    // 10,
    // '#007cbf', // blue at zoom level 12
    // 13,
    // [
    'interpolate',
    ['linear'],
    ['get', 'diff_alojamentos_2011'], // assuming 'propAL' is the property in your data
    0,
    '#98FB98', // light blue for propAL = 0
    100,
    '#006400', // dark blue for propAL = 100
    // ],
  ],
  'fill-opacity': 1,
  'fill-color-transition': { duration: 500 },
}

// Map 3

const seccaoPaint: mapboxgl.FillPaint = {
  'fill-color': [
    // 'interpolate',
    // ['linear'],
    // ['zoom'],
    // 10,
    // '#007cbf', // blue at zoom level 12
    // 13,
    // [
    'interpolate',
    ['linear'],
    ['get', 'propAL'], // assuming 'propAL' is the property in your data
    0,
    '#ADD8E6', // light blue for propAL = 0
    100,
    '#00008B', // dark blue for propAL = 100
    // ],
  ],
  'fill-opacity': 0.8,
  'fill-outline-color': '#00008C',
  'fill-color-transition': { duration: 500 },
}

type Props = {
  city: string
}

const Map = ({ city }: Props) => {
  let alData, freguesiaData, seccaoData, mapCenter

  if (city === 'Porto') {
    alData = useData('al.json').data
    freguesiaData = useData('censos_freguesia.json').data
    seccaoData = useData('censos_seccao.json').data

    mapCenter = [-8.623, 41.162]
  } else {
    alData = useData('al-lisboa.json').data
    freguesiaData = useData('censos_freguesia_lisboa.json').data
    seccaoData = useData('censos_seccao_lisboa.json').data

    mapCenter = [-9.146, 38.735]
  }

  const divTrigger = React.useRef(null!)
  const mapPin = React.useRef(null!)

  const mapContainer = React.useRef(null!)
  const progressBar = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

  const action1 = React.useRef(null!)
  const action2 = React.useRef(null!)
  const action3 = React.useRef(null!)
  const action4 = React.useRef(null!)
  const action5 = React.useRef(null!)
  const action6 = React.useRef(null!)

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

  useEffect(() => {
    document.body.style.overflow = !map.current
      ? 'hidden'
      : map.current.loaded()
      ? 'scroll'
      : 'hidden'

    if (alData && freguesiaData && seccaoData) {
      if (map.current) return

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: mapCenter,
        zoom: 12,
        interactive: false,
      })

      map.current.on('load', () => {
        document.body.style.overflow = 'scroll'

        // SCROLL TRIGGERS

        // Trigger 1: pins map and progress bar to the top of the screen

        ScrollTrigger.create({
          id: 'map-pin',
          trigger: divTrigger.current,
          start: 'top top',
          end: 'bottom top',
          pin: mapPin.current,
        })

        ScrollTrigger.create({
          id: 'progress-bar-pin',
          trigger: divTrigger.current,
          start: 'top top',
          end: 'bottom top',
          pin: progressBar.current,
        })

        // Trigger 2: makes progress bar fill up and updates map

        ScrollTrigger.create({
          id: 'progress-bar',
          trigger: divTrigger.current,
          start: 'top top',
          endTrigger: action1.current,
          end: 'center center',
          onUpdate: self => {
            const scrollProgress = self.progress
            const dateValue = gsap.utils.clamp(0, 1, scrollProgress)
            setNormalizedDate(dateValue)
            setBarWidth(`${scrollProgress * 100}%`)
            map.current?.setFilter('porto-al', ['<=', ['get', 'normalized_date'], dateValue])
          },
          onLeave: () => gsap.to('.progress-bar', { opacity: 0, duration: 0.5 }),
          onEnterBack: () => gsap.to('.progress-bar', { opacity: 1, duration: 0.5 }),
        })

        // Trigger 3: makes next section appear on top of the map

        ScrollTrigger.create({
          id: 'plot-full-screen',
          trigger: action1.current,
          start: 'top middle',
          endTrigger: action2.current,
          end: 'bottom bottom',
          onEnter: () => gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 }),
          onLeave: () => {
            gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
            map.current?.setLayoutProperty('porto-al', 'visibility', 'none')
            map.current?.setLayoutProperty('porto-freguesia', 'visibility', 'visible')
          },
          onEnterBack: () => {
            gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 })
            map.current?.setLayoutProperty('porto-al', 'visibility', 'visible')
            map.current?.setLayoutProperty('porto-freguesia', 'visibility', 'none')
          },
          onLeaveBack: () => gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 }),
        })

        // Trigger 4:

        ScrollTrigger.create({
          trigger: action3.current,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => {
            map.current?.setPaintProperty(
              'porto-freguesia',
              'fill-color',
              freguesiaPaintPop['fill-color'],
            )
          },
        })

        // Trigger 5:

        ScrollTrigger.create({
          trigger: action4.current,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => {
            map.current?.setPaintProperty(
              'porto-freguesia',
              'fill-color',
              freguesiaPaintAL['fill-color'],
            )
          },
        })

        // TRIgger 5:

        ScrollTrigger.create({
          trigger: action5.current,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => {
            gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
            map.current?.setLayoutProperty('porto-freguesia', 'visibility', 'none')
            map.current?.setLayoutProperty('porto-seccao', 'visibility', 'visible')
          },
          onLeaveBack: () => {
            map.current?.setLayoutProperty('porto-freguesia', 'visibility', 'visible')
            map.current?.setLayoutProperty('porto-seccao', 'visibility', 'none')
          },
        })

        ScrollTrigger.create({
          trigger: action6.current,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => {
            gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
            map.current?.setLayoutProperty('porto-seccao', 'visibility', 'none')
            map.current?.setLayoutProperty('porto-al-megahosts', 'visibility', 'visible')
          },
          onLeaveBack: () => {
            map.current?.setLayoutProperty('porto-seccao', 'visibility', 'visible')
            map.current?.setLayoutProperty('porto-al-megahosts', 'visibility', 'none')
          },
        })

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
            Desde essa altura, a oferta deste tipo de alojamentos não tem parado de crescer. O
            tamanho dos pontos representa a quantidade de ALs num mesmo número de porta.
          </div>
          <div ref={action1} className="text-box">
            À data de novembro de 2023, foram atribuídas no total 10463 licenças de alojamento
            local* na cidade do Porto.
          </div>
          <div className="text-box">text1</div>
          <div ref={action2} className="text-box">
            text1
          </div>
          <div className="text-box">
            Obviamente, a cidade não é afetada pelo alojamento local da mesma forma em todo o lado.
            As freguesias do Centro Histórico são as mais afetadas.
          </div>
          <div ref={action3} className="text-box">
            São precisamente as freguesias onde os ALs são mais incidentes que também mais população
            perderam na última década.
          </div>
          <div ref={action4} className="text-box">
            E também as que mais alojamentos de habitação perderam.
          </div>
          <div ref={action5} className="text-box">
            O mapa por quarteirões permite perceber melhor a concentração de ALs em alguns locais da
            cidade, que se transformaram numa verdadeira monocultura do turismo.
          </div>
          <div ref={action6} className="text-box">
            Existem até vários quarteirões que já não têm habitantes, apenas alojamentos locais.
          </div>
        </div>
      </div>
    </>
  )
}

export default Map
