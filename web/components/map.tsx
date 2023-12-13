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
  const { data: freguesiaData } = useData('censos_freguesia.json')
  const { data: seccaoData } = useData('censos_seccao.json')

  const [normalizedDate, setNormalizedDate] = React.useState(0)
  const [barWidth, setBarWidth] = React.useState('0%')

  const formatDate = value => {
    const startDate = new Date('2014-01-01')
    const endDate = new Date('2023-11-15')
    const timeRange = endDate.valueOf() - startDate.valueOf()
    const date = new Date(startDate.getTime() + value * timeRange)
    return date.toLocaleDateString('pt-pt', { year: 'numeric', month: 'long' })
  }

  const mapContainer = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  })

  gsap.registerPlugin(ScrollTrigger)

  useEffect(() => {
    document.body.style.overflow = !map.current
      ? 'hidden'
      : map.current.loaded()
      ? 'scroll'
      : 'hidden'

    if (alData && freguesiaData && seccaoData) {
      if (map.current) return // initialize map only once

      ScrollTrigger.create({
        trigger: mapContainer.current,
        markers: true,
        pin: true,
        start: 'top top', // when the top of the trigger hits the top of the viewport
        end: () => `+=2000`, // when the bottom of the trigger hits the bottom of the viewport
        onEnter: () => setNormalizedDate(0),
        onUpdate: self => {
          const scrollProgress = self.progress // Value from 0 to 1
          const dateValue = gsap.utils.clamp(0, 1, scrollProgress)
          setNormalizedDate(dateValue)
          setBarWidth(`${scrollProgress * 100}%`)

          if (map.current) {
            map.current.setFilter('porto-al', ['<=', ['get', 'normalized_date'], dateValue])
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

        const layers = map.current?.getStyle().layers
        const layerIds = []
        for (const layer of layers) {
          //if (layer.type === 'symbol' || layer.type === 'line') layerIds.push(layer.id)
        }

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

        // PORTO AL (FIRST MAP)

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

        map.current.on('mouseenter', 'porto-al', e => {
          // Change the cursor style as a UI indicator.
          map.current.getCanvas().style.cursor = 'pointer'
          console.log(e.features[0].properties.endereco)

          popup
            .setLngLat(e.lngLat)
            .setHTML(
              '<p><b>Entradas repetidas: </b>' +
                e.features[0].properties.entradas_repetidas +
                '</p><p><b>Endereço: </b>' +
                e.features[0].properties.endereco +
                '</p>',
            )
            .addTo(map.current)
        })

        map.current.on('mouseleave', 'porto-al', () => {
          map.current.getCanvas().style.cursor = ''
          popup.remove()
        })

        // PORTO FREGUESIAS (SECOND MAP)

        //   map.current?.addLayer({
        //     id: 'porto-freguesia',
        //     type: 'fill',
        //     source: 'porto-freguesia',
        //     layout: {},
        //     paint: {
        //       'fill-color': [
        //         'interpolate',
        //         ['linear'],
        //         ['zoom'],
        //         10,
        //         '#007cbf', // blue at zoom level 12
        //         13,
        //         [
        //           'interpolate',
        //           ['linear'],
        //           ['get', 'propAL'], // assuming 'propAL' is the property in your data
        //           0,
        //           '#ADD8E6', // light blue for propAL = 0
        //           100,
        //           '#00008B', // dark blue for propAL = 100
        //         ],
        //       ],
        //       'fill-opacity': 1,
        //     },
        //   })

        //   map.current?.moveLayer('porto-freguesia', layerIds[0])

        //   map.current?.addLayer({
        //     id: 'porto-freguesia-outline',
        //     type: 'line',
        //     source: 'porto-freguesia',
        //     layout: {},
        //     paint: {
        //       'line-color': '#007cbf',
        //       'line-width': 2,
        //     },
        //   })

        // PORTO SECCOES (THIRD MAP)

        // map.current?.addLayer({
        //   id: 'porto-seccao',
        //   type: 'fill',
        //   source: 'porto-seccao',
        //   layout: {},
        //   paint: {
        //     'fill-color': [
        //       'interpolate',
        //       ['linear'],
        //       ['zoom'],
        //       10,
        //       '#007cbf', // blue at zoom level 12
        //       13,
        //       [
        //         'interpolate',
        //         ['linear'],
        //         ['get', 'propAL'], // assuming 'propAL' is the property in your data
        //         0,
        //         '#ADD8E6', // light blue for propAL = 0
        //         100,
        //         '#00008B', // dark blue for propAL = 100
        //       ],
        //     ],
        //     'fill-opacity': 0.8,
        //     'fill-outline-color': '#00008C'
        //   },
        // })

        map.current.on('mousemove', 'porto-seccao', e => {
          // Change the cursor style as a UI indicator.
          map.current.getCanvas().style.cursor = 'pointer'

          popup
            .setLngLat(e.lngLat)
            .setHTML(
              '<p><b>ALs: </b>' +
                e.features[0].properties.als +
                '</p><p><b>Alojamentos: </b>' +
                e.features[0].properties.alojamentos +
                '</p><p><b>Habitantes: </b>' +
                e.features[0].properties.individuos +
                '</p><p><b>propAL: </b>' +
                e.features[0].properties.propAL +
                '%</p>',
            )
            .addTo(map.current)
        })

        map.current.on('mouseleave', 'porto-seccao', () => {
          map.current.getCanvas().style.cursor = ''
          popup.remove()
        })

        map.current?.moveLayer('porto-seccao', layerIds[0])
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [alData, freguesiaData, seccaoData])

  return (
    <>
      <div className="whole-container">
        <div
          className="scroll-bar-container"
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 10}}>
          <div className="scroll-bar" style={{width: barWidth}}>
          <span className="scroll-text">
            {formatDate(normalizedDate)}
          </span>
          </div>
        </div>
        <div className="map-content">
          <div ref={mapContainer} className="map-container" />
        </div>
      </div>
    </>
  )
}

export default Map
