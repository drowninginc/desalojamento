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

const Map = () => {
  const { data: alData } = useData('al.json')

  const divTrigger = React.useRef(null!)
  const mapPin = React.useRef(null!)

  const mapContainer = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

  const action1 = React.useRef(null!)
  const action2 = React.useRef(null!)
  const action3 = React.useRef(null!)
  const action4 = React.useRef(null!)
  const action5 = React.useRef(null!)
  const action6 = React.useRef(null!)
  const action7 = React.useRef(null!)
  const action8 = React.useRef(null!)

  const [normalizedDate, setNormalizedDate] = React.useState(0)
  const [barWidth, setBarWidth] = React.useState('0%')

  const getOpacity = (index: number) => {
    const progress = parseFloat(barWidth) / 100
    return Math.abs(progress - (index + 0.5) / 3) < 1 / 6 ? 1 : 0
  }

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

    if (alData) {
      if (map.current) return // initialize map only once

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: [-8.623, 41.162],
        zoom: 12,
        interactive: false,
      })

      map.current.on('load', () => {
        document.body.style.overflow = 'scroll'

        ScrollTrigger.create({
          id: 'map-pin',
          trigger: divTrigger.current,
          start: 'top top',
          end: 'bottom top',
          pin: mapPin.current,
          onEnter: () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.refresh())
          },
          onEnterBack: () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.refresh())
          },
        })

        ScrollTrigger.create({
          id: 'progress-bar',
          trigger: divTrigger.current,
          start: 'top top', // divTrigger top hits the bottom of the screen
          endTrigger: action4.current, // end when action4 bottom hits the bottom of the screen
          end: 'bottom bottom',
          onUpdate: self => {
            const scrollProgress = self.progress // Value from 0 to 1
            const dateValue = gsap.utils.clamp(0, 1, scrollProgress)
            setNormalizedDate(dateValue)
            setBarWidth(`${scrollProgress * 100}%`)

            if (map.current) {
              map.current.setFilter('porto-al', ['<=', ['get', 'normalized_date'], dateValue])
            }
          },
          onLeave: () => gsap.to('.progress-bar', { opacity: 0, duration: 0.5 }),
          onEnterBack: () => gsap.to('.progress-bar', { opacity: 1, duration: 0.5 }),
        })

        ScrollTrigger.create({
          id: 'plot-full-screen',
          trigger: action4.current,
          start: 'top middle', // divTrigger top hits the bottom of the screen
          endTrigger: action5.current, // end when action4 bottom hits the bottom of the screen
          end: 'bottom bottom',
          onEnter: () => gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 }),
          onLeave: () => gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 }),
          onEnterBack: () => gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 }),
          onLeaveBack: () => gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 }),
        })

        map.current?.addSource('porto-al', {
          type: 'geojson',
          data: alData,
        })

        map.current?.addLayer({
          id: 'porto-al',
          type: 'circle',
          source: 'porto-al',
          paint: {
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
          },
        })

        map.current.setFilter('porto-al', ['<=', ['get', 'normalized_date'], 0])
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [alData])

  return (
    <>
      <div className="whole-container">
        <div className="progress-bar">
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
          <div ref={action1} className="text-box">
            A figura do alojamento local foi introduzido em 2008, mas só em 2014 passou o seu
            registo a ser obrigatório, passando os alojamentos deste tipo que já operavam antes a
            estar integrados nesta designação.
          </div>
          <div ref={action2} className="text-box">
            Desde essa altura, a oferta deste tipo de alojamentos não tem parado de crescer. O
            tamanho dos pontos representa a quantidade de ALs num mesmo número de porta.
          </div>
          <div ref={action3} className="text-box">
            À data de novembro de 2023, foram atribuídas no total 10463 licenças de alojamento
            local* na cidade do Porto.
          </div>
          <div ref={action4} className="text-box">
            text1
          </div>
          <div ref={action5} className="text-box">
            text1
          </div>
          <div ref={action6} className="text-box">
            text1
          </div>
          <div ref={action7} className="text-box">
            text1
          </div>
          <div ref={action8} className="text-box">
            text1
          </div>
        </div>
      </div>
    </>
  )
}

export default Map
 