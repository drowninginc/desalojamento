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

const Map2 = () => {
  const { data: freguesiaData } = useData('censos_freguesia.json')
  const { data: seccaoData } = useData('censos_seccao.json')

  const mapContainer = React.useRef(null!)
  const wholeContainer = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

  gsap.registerPlugin(ScrollTrigger)

  useEffect(() => {
    document.body.style.overflow = !map.current
      ? 'hidden'
      : map.current.loaded()
      ? 'scroll'
      : 'hidden'

    if (freguesiaData && seccaoData) {
      if (map.current) return // initialize map only once

      ScrollTrigger.create({
        trigger: wholeContainer.current,
        markers: true,
        pin: true,
        start: 'top top',
        end: () => `+=3000`,
        onUpdate: self => {
          const scrollProgress = self.progress // Value from 0 to 1
          if (map.current) {
            if (scrollProgress >= 0 && scrollProgress < 1 / 3) {
              // Keep the original color interpolation for propAL
            } else if (scrollProgress >= 1 / 3 && scrollProgress < 2 / 3) {
              // Update to use diff_pop_2011 property for color interpolation
              map.current.setPaintProperty('porto-freguesia', 'fill-color', [
                'interpolate',
                ['linear'],
                ['get', 'diff_pop_2011'],
                -100,
                '#ADD8E6', // Light blue for diff_pop_2011 = -100
                100,
                '#00008B', // Dark blue for diff_pop_2011 = 100
              ])
            } else if (scrollProgress >= 2 / 3) {
              // Make the porto-freguesia layer disappear
              map.current.setLayoutProperty('porto-freguesia', 'visibility', 'none')
              map.current.setLayoutProperty('porto-freguesia-outline', 'visibility', 'none')
              map.current.setLayoutProperty('porto-seccao', 'visibility', 'visible')

              //
            }
          }
        },
      })

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: [-8.623, 41.162],
        zoom: 12,
        interactive: false,
      })

      map.current.on('load', () => {
        document.body.style.overflow = 'scroll'

        map.current?.addSource('porto-freguesia', {
          type: 'geojson',
          data: freguesiaData,
        })

        map.current?.addSource('porto-seccao', {
          type: 'geojson',
          data: seccaoData,
        })

        // PORTO FREGUESIAS (SECOND MAP)

        map.current?.addLayer({
          id: 'porto-freguesia',
          type: 'fill',
          source: 'porto-freguesia',
          layout: {},
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              '#007cbf', // blue at zoom level 12
              13,
              [
                'interpolate',
                ['linear'],
                ['get', 'propAL'], // assuming 'propAL' is the property in your data
                0,
                '#ADD8E6', // light blue for propAL = 0
                100,
                '#00008B', // dark blue for propAL = 100
              ],
            ],
            'fill-opacity': 1,
          },
        })

        map.current?.addLayer({
          id: 'porto-freguesia-outline',
          type: 'line',
          source: 'porto-freguesia',
          layout: {},
          paint: {
            'line-color': '#007cbf',
            'line-width': 2,
          },
        })

        // PORTO SECCOES (THIRD MAP)

        map.current?.addLayer({
          id: 'porto-seccao',
          type: 'fill',
          source: 'porto-seccao',
          layout: {},
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10,
              '#007cbf', // blue at zoom level 12
              13,
              [
                'interpolate',
                ['linear'],
                ['get', 'propAL'], // assuming 'propAL' is the property in your data
                0,
                '#ADD8E6', // light blue for propAL = 0
                100,
                '#00008B', // dark blue for propAL = 100
              ],
            ],
            'fill-opacity': 0.8,
            'fill-outline-color': '#00008C',
          },
        })

        map.current.setLayoutProperty('porto-seccao', 'visibility', 'none')
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [freguesiaData, seccaoData])

  return (
    <>
      <div ref={wholeContainer} className="whole-container">
        <div className="map-content">
          <div ref={mapContainer} className="map-container" />
        </div>
      </div>
    </>
  )
}

export default Map2
