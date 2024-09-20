import useSWR from 'swr'
import fetcher from '../../libs/fetcher'
import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

export const useData = (path: string) => useSWR<any>(`./static/data/${path}`, fetcher)

export const getMinMax = (data, property) => {
  const values = data.features.map(feature => feature.properties[property])
  return [Math.min(...values), Math.max(...values)]
}

export const getCityData = city => {
  const alData = useData(city + '/al.json').data
  const freguesiaData = useData(city + '/censosFreguesia.json').data
  const seccaoData = useData(city + '/censosSeccao.json').data

  return { alData, freguesiaData, seccaoData }
}

export const createMap = (container, city, cityDefinitions) => {
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/light-v10?optimize=true',
    center: cityDefinitions[city].mapCenter,
    zoom: cityDefinitions[city].zoom,
    interactive: false,
  })
}

export const addSourcesAndLayers = (
  city,
  map,
  alData,
  freguesiaData,
  seccaoData,
  alPaint,
  freguesiaPaint,
  seccaoPaint,
  alPaintMegaHost,
) => {
  map.addSource(`${city}-al`, {
    type: 'geojson',
    data: alData,
  })

  map.addSource(`${city}-freguesia`, {
    type: 'geojson',
    data: freguesiaData,
  })

  map.addSource(`${city}-seccao`, {
    type: 'geojson',
    data: seccaoData,
  })

  map.addLayer({
    id: `${city}-al`,
    type: 'circle',
    source: `${city}-al`,
    paint: alPaint,
    filter: ['<=', ['get', 'normalized_date'], 0],
  })

  map.addLayer({
    id: `${city}-freguesia`,
    type: 'fill',
    source: `${city}-freguesia`,
    layout: {
      visibility: 'none',
    },
    paint: freguesiaPaint,
  })

  map.addLayer({
    id: `${city}-freguesia-outline`,
    type: 'line',
    source: `${city}-freguesia`,
    layout: {
      visibility: 'none',
    },
    paint: {
      'line-color': '#007cbf',
      'line-width': 3,
    },
  })

  map.addLayer({
    id: `${city}-seccao`,
    type: 'fill',
    source: `${city}-seccao`,
    layout: {
      visibility: 'none',
    },
    paint: seccaoPaint,
  })

  map.addLayer({
    id: `${city}-al-megahosts`,
    type: 'circle',
    source: `${city}-al`,
    layout: {
      visibility: 'none',
    },
    paint: alPaintMegaHost,
  })
}

export const addCentroidMarkers = (map, data, property) => {
  const markers = []
  if (data && data.features) {
    data.features.forEach(feature => {
      const centroid = turf.centroid(feature).geometry.coordinates
      const value = feature.properties[property]

      const markerElement = document.createElement('div')
      markerElement.className = 'centroid-marker'

      const wrapperElement = document.createElement('div')
      wrapperElement.className = 'animation-wrapper'
      wrapperElement.innerText = `${value.toFixed(1)}%`

      markerElement.appendChild(wrapperElement)

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([centroid[0], centroid[1]])
        .addTo(map)
      marker.getElement().classList.add('hidden')
      markers.push(marker)
    })
  }
  return markers
}

export const updateMarkerValues = (markers, data, property) => {
  data.features.forEach((feature, index) => {
    const value = feature.properties[property]
    const element = markers[index].getElement()
    const wrapper = element.querySelector('.animation-wrapper')
    if (wrapper) {
      wrapper.innerText = `${value.toFixed(1)}%`
    }
  })
}

export const setMarkerVisibility = (markers, visibility) => {
  console.log(visibility)
  markers.forEach(marker => {
    const element = marker.getElement()
    const wrapper = element.querySelector('.animation-wrapper')
    console.log(wrapper)
    if (visibility === 'block') {
      wrapper.classList.add('visible')
      wrapper.classList.remove('hidden')
      element.classList.add('visible')
      element.classList.remove('hidden')
    } else {
      wrapper.classList.add('hidden')
      wrapper.classList.remove('visible')
      element.classList.add('hidden')
      element.classList.remove('visible')
    }
  })
}
