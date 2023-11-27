import useSWR from 'swr'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import fetcher from '../libs/fetcher'
import React, { useRef, useEffect } from 'react'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2xhdWRpb2xlbW9zIiwiYSI6ImNsMDV4NXBxajBzMWkzYm9ndXhzbTk5ZHkifQ.85n9mjZbTDUpyQZrrJTBwA'

const useData = (path: string) => useSWR<any>(`./static/data/${path}`, fetcher)

const Map = () => {
  const { data: alData } = useData('al.json')
  const { data: freguesiaData } = useData('censos_freguesia.json')
  const { data: seccaoData } = useData('censos_seccao.json')

  const mapContainer = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

   const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });

  useEffect(() => {
    document.body.style.overflow = !map.current
      ? 'hidden'
      : map.current.loaded()
      ? 'scroll'
      : 'hidden'

    if (alData && freguesiaData && seccaoData) {
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
      /*
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
            'circle-color': '#007cbf',
          },
        })

        map.current.on('mouseenter', 'porto-al', (e) => {
          // Change the cursor style as a UI indicator.
          map.current.getCanvas().style.cursor = 'pointer';
          console.log(e.features[0].properties.endereco)
           
          popup.setLngLat(e.lngLat).setHTML('<p><b>Entradas repetidas: </b>' + e.features[0].properties.entradas_repetidas + '</p><p><b>Endereço: </b>' + e.features[0].properties.endereco + '</p>').addTo(map.current);
        });

        map.current.on('mouseleave', 'porto-al', () => {
          map.current.getCanvas().style.cursor = '';
          popup.remove();
        });*/

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
            'fill-outline-color': '#00008C'
          },
        })

        

        map.current.on('mousemove', 'porto-seccao', (e) => {
          // Change the cursor style as a UI indicator.
          map.current.getCanvas().style.cursor = 'pointer';
           
          popup.setLngLat(e.lngLat).setHTML('<p><b>ALs: </b>' + e.features[0].properties.als + '</p><p><b>Alojamentos: </b>' + e.features[0].properties.alojamentos + '</p><p><b>Habitantes: </b>' + e.features[0].properties.individuos + '</p><p><b>propAL: </b>' + e.features[0].properties.propAL + '%</p>').addTo(map.current);
        });

        map.current.on('mouseleave', 'porto-seccao', () => {
          map.current.getCanvas().style.cursor = '';
          popup.remove();
        });

        map.current?.moveLayer('porto-seccao', layerIds[0])
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
