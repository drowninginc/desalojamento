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
  const monthlyCountsData = useData(city + '/monthlyCounts.json').data
  const hotelsData = useData(city + '/hotels.json').data

  return { alData, freguesiaData, monthlyCountsData, hotelsData }
}

// New function to load data for both cities
export const getBothCitiesData = () => {
  const lisbonData = getCityData('Lisbon')
  const portoData = getCityData('Porto')

  return {
    Lisbon: lisbonData,
    Porto: portoData,
    // Check if all data is loaded
    isLoaded:
      lisbonData.alData &&
      lisbonData.freguesiaData &&
      lisbonData.monthlyCountsData &&
      lisbonData.hotelsData &&
      portoData.alData &&
      portoData.freguesiaData &&
      portoData.monthlyCountsData &&
      portoData.hotelsData,
  }
}

export const createMap = (container, cityDefinitions, setBoundaryBox, initialCity = 'Lisbon') => {
  setBoundaryBox(cityDefinitions[initialCity].boundingBox)
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/light-v10?optimize=true',
    bounds: cityDefinitions[initialCity].boundingBox,
    interactive: false,
  })
}

export const addSourcesAndLayersForBothCities = (
  map,
  citiesData,
  alPaint,
  freguesiaPaint,
  alPaintMegaHost,
  hotelsPaint,
) => {
  ;['Lisbon', 'Porto'].forEach(city => {
    const cityData = citiesData[city]

    map.addSource(`${city}-al`, {
      type: 'geojson',
      data: cityData.alData,
    })

    map.addSource(`${city}-freguesia`, {
      type: 'geojson',
      data: cityData.freguesiaData,
    })

    map.addSource(`${city}-hotels`, {
      type: 'geojson',
      data: cityData.hotelsData,
    })

    // Add hotels layer first (bottom layer)
    map.addLayer({
      id: `${city}-hotels`,
      type: 'fill',
      source: `${city}-hotels`,
      layout: {
        visibility: city === 'Lisbon' ? 'none' : 'none', // Initially hidden for both
      },
      paint: hotelsPaint,
    })

    map.addLayer({
      id: `${city}-al`,
      type: 'circle',
      source: `${city}-al`,
      layout: {
        visibility: city === 'Lisbon' ? 'visible' : 'none', // Show only Lisbon initially
      },
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
      id: `${city}-al-megahosts`,
      type: 'circle',
      source: `${city}-al`,
      layout: {
        visibility: 'none',
      },
      paint: alPaintMegaHost,
    })
  })
}

// Original function for backward compatibility
export const addSourcesAndLayers = (
  city,
  map,
  alData,
  freguesiaData,
  hotelsData,
  alPaint,
  freguesiaPaint,
  alPaintMegaHost,
  hotelsPaint,
) => {
  map.addSource(`${city}-al`, {
    type: 'geojson',
    data: alData,
  })

  map.addSource(`${city}-freguesia`, {
    type: 'geojson',
    data: freguesiaData,
  })

  map.addSource(`${city}-hotels`, {
    type: 'geojson',
    data: hotelsData,
  })

  // Add hotels layer first (bottom layer)
  map.addLayer({
    id: `${city}-hotels`,
    type: 'fill',
    source: `${city}-hotels`,
    layout: {
      visibility: 'none',
    },
    paint: hotelsPaint,
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
    id: `${city}-al-megahosts`,
    type: 'circle',
    source: `${city}-al`,
    layout: {
      visibility: 'none',
    },
    paint: alPaintMegaHost,
  })
}

// Function to switch between cities without recreating the map
export const switchCity = (
  map,
  newCity,
  currentCity,
  cityDefinitions,
  setBoundaryBox,
  isMobile = false,
) => {
  // Hide all layers for current city
  if (currentCity) {
    const currentCityLayers = [
      `${currentCity}-al`,
      `${currentCity}-freguesia`,
      `${currentCity}-al-megahosts`,
      `${currentCity}-hotels`,
      `${currentCity}-freguesia-outline`,
    ]
    currentCityLayers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', 'none')
      }
    })
  }

  // Show AL layer for new city (others stay hidden until scroll triggers activate them)
  map.setLayoutProperty(`${newCity}-al`, 'visibility', 'visible')

  // Update map bounds to new city
  const bounds = isMobile
    ? cityDefinitions[newCity].boundingBoxMobile || cityDefinitions[newCity].boundingBox
    : cityDefinitions[newCity].boundingBox
  setBoundaryBox(bounds)
  map.fitBounds(bounds, { duration: 1000 })
}

export const addCentroidMarkers = (map, data, properties) => {
  const markers = []
  if (data && data.features) {
    data.features.forEach(feature => {
      const bbox = turf.bbox(feature)
      const centroid = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]

      const markerElement = document.createElement('div')
      markerElement.className = 'centroid-marker'

      const wrapperElement = document.createElement('div')
      wrapperElement.className = 'animation-wrapper'

      const textElement = document.createElement('div')
      textElement.className = 'freg-name'
      textElement.innerText = `${feature.properties.freg_name}`

      // Append the text element to the wrapper
      wrapperElement.appendChild(textElement)

      properties.forEach(property => {
        const value = feature.properties[property]
        const valueElement = document.createElement('div')
        valueElement.className = `marker-cell ${property}`

        const iconElement = document.createElement('div')
        iconElement.className = 'cell-icon'
        if (property === 'propAL') {
          iconElement.innerText = 'AL'
        } else if (property === 'diff_pop_2011') {
          iconElement.innerText = '👪'
        } else if (property === 'diff_alojamentos_2011') {
          iconElement.innerText = '🏠'
        }

        const textElement = document.createElement('div')
        textElement.className = 'cell-text'
        textElement.innerText = `${value.toFixed(
          value.toFixed(0) === '0' || value.toFixed(0) === '-0' ? 1 : 0,
        )}%`

        if (value > 0) {
          textElement.classList.add('positive-number')
        } else if (value < 0) {
          textElement.classList.add('negative-number')
        }

        valueElement.appendChild(iconElement)
        valueElement.appendChild(textElement)
        wrapperElement.appendChild(valueElement)
      })

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

export const updateMarkerValues = (markers, properties) => {
  markers.forEach(marker => {
    const element = marker.getElement()
    const wrapper = element.querySelector('.animation-wrapper')
    const cells = wrapper.querySelectorAll('.marker-cell')

    cells.forEach(cell => {
      if (properties.includes(cell.classList[1])) {
        cell.classList.add('visible')
        cell.classList.remove('hidden')
      } else {
        cell.classList.add('hidden')
        cell.classList.remove('visible')
      }
    })
  })
}

export const setMarkerVisibility = (markers, visibility) => {
  markers.forEach(marker => {
    const element = marker.getElement()
    const wrapper = element.querySelector('.animation-wrapper')
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

export const formatNumber = (value: number, language: string) => {
  const roundedValue = Math.round(value / 1000)
  return language === 'en' ? `${roundedValue}k` : `${roundedValue} mil`
}

export const changeBoundaryBox = (map, setBoundaryBox, boundaryBox) => {
  map.fitBounds(boundaryBox)
  setBoundaryBox(boundaryBox)
}
