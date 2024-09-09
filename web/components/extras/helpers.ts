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
  map.addSource('porto-al', {
    type: 'geojson',
    data: alData,
  })

  map.addSource('porto-freguesia', {
    type: 'geojson',
    data: freguesiaData,
  })

  map.addSource('porto-seccao', {
    type: 'geojson',
    data: seccaoData,
  })

  map.addLayer({
    id: 'porto-al',
    type: 'circle',
    source: 'porto-al',
    paint: alPaint,
    filter: ['<=', ['get', 'normalized_date'], 0],
  })

  map.addLayer({
    id: 'porto-freguesia',
    type: 'fill',
    source: 'porto-freguesia',
    layout: {
      visibility: 'none',
    },
    paint: freguesiaPaint,
  })

  map.addLayer({
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

  map.addLayer({
    id: 'porto-seccao',
    type: 'fill',
    source: 'porto-seccao',
    layout: {
      visibility: 'none',
    },
    paint: seccaoPaint,
  })

  map.addLayer({
    id: 'porto-al-megahosts',
    type: 'circle',
    source: 'porto-al',
    layout: {
      visibility: 'none',
    },
    paint: alPaintMegaHost,
  })
}
