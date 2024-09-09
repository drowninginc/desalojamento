import useSWR from 'swr'
import fetcher from '/libs/fetcher'
import mapboxgl from 'mapbox-gl'

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
  freguesiaPaintPop,
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
      'line-width': 1,
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
