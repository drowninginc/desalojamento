import mapboxgl from 'mapbox-gl'

export const cityDefinitions = {
  Porto: {
    mapCenter: [-8.653, 41.162],
    zoom: 12.3,
    center: {
      mapCenter: [-8.618, 41.153],
      zoom: 14,
    },
  },
  Lisbon: {
    mapCenter: [-9.146, 38.735],
    zoom: 12.3,
    center: {
      mapCenter: [-9.146, 38.715],
      zoom: 14,
    },
  },
}

// Map 1
export const alPaint: mapboxgl.CirclePaint = {
  'circle-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    12,
    ['interpolate', ['linear'], ['get', 'weight'], 0, 2, 1, 6],
  ],
  'circle-color': '#012169',
  'circle-opacity': 1,
}

export const alPaintMegaHost: mapboxgl.CirclePaint = {
  'circle-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    12,
    ['interpolate', ['linear'], ['get', 'weight'], 0, 2, 1, 6],
  ],
  'circle-color': ['case', ['>=', ['get', 'host_listings_number'], 2], '#ff1654', '#012169'],
}

// Map 2
export const freguesiaPaint: mapboxgl.FillPaint = {
  'fill-color': [
    'interpolate',
    ['linear'],
    ['get', 'propAL'],
    0,
    'rgba(173, 216, 230, 0.2)',
    30,
    'rgba(0, 0, 205, 0.8)',
    50,
    'rgba(0, 0, 139, 1)',
    100,
    'rgba(0, 0, 139, 1)',
  ],
  'fill-opacity': 0.7,
  'fill-color-transition': { duration: 500 },
}

// Map 3
export const seccaoPaint: mapboxgl.FillPaint = {
  'fill-color': ['interpolate', ['linear'], ['get', 'propAL'], 0, '#ADD8E6', 100, '#00008B'],
  'fill-opacity': 0.8,
  'fill-outline-color': '#00008C',
  'fill-color-transition': { duration: 500 },
}
