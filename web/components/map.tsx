import useSWR from 'swr'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import fetcher from '../libs/fetcher'
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'
import React, { useRef, useEffect } from 'react'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2xhdWRpb2xlbW9zIiwiYSI6ImNsMDV4NXBxajBzMWkzYm9ndXhzbTk5ZHkifQ.85n9mjZbTDUpyQZrrJTBwA'

const Map = () => {
  const { data } = useSWR<FeatureCollection<Geometry, GeoJsonProperties>>(
    './static/data/al.v1.json',
    fetcher,
  )

  const mapContainer = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    document.body.style.overflow = !map.current
      ? 'hidden'
      : map.current.loaded()
      ? 'scroll'
      : 'hidden'

    if (data) {
      if (map.current) return // initialize map only once

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10?optimize=true',
        center: [-8.623, 41.162],
        zoom: 12,
        // interactive: false,
      })

      map.current.on('load', () => {
        document.body.style.overflow = 'scroll'

        map.current?.addSource('porto', {
          type: 'geojson',
          data: data,
        })

        // streets with gender: 'NA' are loaded on the map
        map.current?.addLayer({
          id: 'porto-al',
          type: 'circle',
          source: 'porto',
          paint: {
            'circle-color': '#20c3aa',
          },
          // filter: ['==', 'gender', 'M'],
        })

        // // streets with gender: 'F' are loaded on the map
        // map.current?.addLayer({
        //   id: 'porto-f',
        //   type: 'line',
        //   source: 'porto',
        //   paint: {
        //     'line-color': '#8724f6',
        //     'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 5],
        //     'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 0.4],
        //     'line-color-transition': {
        //       duration: 750,
        //     },
        //   },
        //   filter: ['==', 'gender', 'F'],
        // })

        // // streets with gender: 'NA' are loaded on the map
        // map.current?.addLayer({
        //   id: 'porto-na',
        //   type: 'line',
        //   source: 'porto',
        //   paint: {
        //     'line-color': '#bababa',
        //     'line-color-transition': {
        //       duration: 750,
        //     },
        //   },
        //   filter: ['==', 'gender', 'NA'],
        // })
      })
    }
  })

  return (
    <>
      <div className="whole-container">
        <div className="map-content">
          <div ref={mapContainer} className="map-container" />
        </div>
      </div>
    </>
  )
}

export default Map
