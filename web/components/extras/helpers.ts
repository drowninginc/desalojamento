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

export const createMap = (
  container,
  cityDefinitions,
  setBoundaryBox,
  initialCity = 'Lisbon',
  isMobile = false,
) => {
  const bounds = isMobile
    ? cityDefinitions[initialCity].boundingBoxMobile || cityDefinitions[initialCity].boundingBox
    : cityDefinitions[initialCity].boundingBox
  setBoundaryBox(bounds)
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/light-v10?optimize=true',
    bounds: bounds,
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
  const cities = ['Lisbon', 'Porto']
  cities.forEach(city => {
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
  map.fitBounds(bounds, { duration: 300 })
}

export const addCentroidMarkers = (map, data, properties) => {
  const markers = []
  if (data && data.features) {
    // Sort features by propAL from higher to smaller values
    const sortedFeatures = [...data.features].sort((a, b) => {
      const propALa = a.properties.propAL || 0
      const propALb = b.properties.propAL || 0
      return propALb - propALa // Higher values first
    })

    sortedFeatures.forEach(feature => {
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

export const setMarkerVisibility = (markers, visibility, gradually = false) => {
  markers.forEach((marker, index) => {
    const element = marker.getElement()
    const wrapper = element.querySelector('.animation-wrapper')

    if (visibility === 'block') {
      // Add staggered delay for sequential appearance (higher propAL first)

      const delay = gradually ? index * 100 : 0 // 100ms delay between each marker if gradually, else zero

      // If there is a pending timeout for this element, clear it first
      const existingTimeoutId = element.getAttribute('data-timeout-id')
      if (existingTimeoutId) {
        clearTimeout(Number(existingTimeoutId))
        element.removeAttribute('data-timeout-id')
      }

      if (delay === 0) {
        wrapper.classList.add('visible')
        wrapper.classList.remove('hidden')
        element.classList.add('visible')
        element.classList.remove('hidden')
      } else {
        const timeoutId = window.setTimeout(() => {
          wrapper.classList.add('visible')
          wrapper.classList.remove('hidden')
          element.classList.add('visible')
          element.classList.remove('hidden')
          element.removeAttribute('data-timeout-id')
        }, delay)
        element.setAttribute('data-timeout-id', String(timeoutId))
      }
    } else {
      // Hide all markers immediately
      const existingTimeoutId = element.getAttribute('data-timeout-id')
      if (existingTimeoutId) {
        clearTimeout(Number(existingTimeoutId))
        element.removeAttribute('data-timeout-id')
      }
      wrapper.classList.add('hidden')
      wrapper.classList.remove('visible')
      element.classList.add('hidden')
      element.classList.remove('visible')
    }
  })
}

export const abortMarkerAnimations = markers => {
  markers.forEach(marker => {
    const element = marker.getElement()
    const existingTimeoutId = element.getAttribute('data-timeout-id')
    if (existingTimeoutId) {
      clearTimeout(Number(existingTimeoutId))
      element.removeAttribute('data-timeout-id')
    }
  })
}

export const formatNumber = (value: number, language: string) => {
  const roundedValue = Math.round(value / 1000)
  return language === 'en' ? `${roundedValue}k` : `${roundedValue} mil`
}

// Function to change map language using setLayoutProperty
export const setMapLanguage = (map: mapboxgl.Map, language: string) => {
  if (!map || !map.loaded()) {
    console.warn('Map not loaded, cannot set language')
    return
  }

  // Get all layers in the map
  const style = map.getStyle()
  if (!style || !style.layers) {
    console.warn('Map style or layers not available')
    return
  }

  // List of common place label layer IDs in Mapbox styles
  const labelLayerPatterns = [
    'country-label',
    'state-label',
    'settlement-major-label',
    'settlement-minor-label',
    'settlement-subdivision-label',
    'place-city-label',
    'place-town-label',
    'place-village-label',
    'place',
    'place-label',
    'water-label',
    'waterway-label',
  ]

  let updatedLayersCount = 0

  // Update text-field for all symbol layers that have text-field property
  style.layers.forEach(layer => {
    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
      try {
        // Check if this is likely a place label layer
        const isLabelLayer = labelLayerPatterns.some(
          pattern =>
            layer.id.includes(pattern) || (layer.source && layer.source.includes('composite')),
        )

        if (isLabelLayer) {
          // Set language based on Mapbox Streets v8 tileset language codes
          // Portuguese uses 'pt' code, English uses 'en' code
          const languageExpression =
            language === 'pt'
              ? ['coalesce', ['get', 'name_pt'], ['get', 'name']]
              : ['coalesce', ['get', 'name_en'], ['get', 'name']]

          map.setLayoutProperty(layer.id, 'text-field', languageExpression)
          updatedLayersCount++
        }
      } catch (error) {
        // If the specific language field doesn't exist, continue with next layer
        console.warn(`Could not set language for layer ${layer.id}:`, error)
      }
    }
  })
}

// Debug function to list all available layers
export const debugMapLayers = (map: mapboxgl.Map) => {
  if (!map || !map.loaded()) {
    console.warn('Map not loaded, cannot debug layers')
    return
  }

  const style = map.getStyle()
  if (!style || !style.layers) {
    console.warn('Map style or layers not available')
    return
  }
}

export const changeBoundaryBox = (map, setBoundaryBox, boundaryBox) => {
  map.fitBounds(boundaryBox)
  setBoundaryBox(boundaryBox)
}
