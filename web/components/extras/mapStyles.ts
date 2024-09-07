import mapboxgl from 'mapbox-gl'

export const cityDefinitions = {
  Porto: {
    mapCenter: [-8.653, 41.162],
    zoom: 12.3,
  },
  Lisboa: {
    mapCenter: [-9.146, 38.735],
    zoom: 12.3,
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
    16,
    ['interpolate', ['linear'], ['get', 'weight'], 0, 4, 1, 20],
  ],
  'circle-color': '#012169',
  'circle-opacity': 1, // Ensure default opacity is set to 1
}

export const alPaintMegaHost: mapboxgl.CirclePaint = {
  'circle-radius': [
    'interpolate',
    ['linear'],
    ['zoom'],
    12,
    ['interpolate', ['linear'], ['get', 'weight'], 0, 2, 1, 6],
    16,
    ['interpolate', ['linear'], ['get', 'weight'], 0, 4, 1, 20],
  ],
  'circle-color': ['case', ['==', ['get', 'mega_host_2'], 'True'], '#ff1654', '#012169'],
}

// Map 2
export const freguesiaPaint: mapboxgl.FillPaint = {
  'fill-color': [
    'interpolate',
    ['linear'],
    ['get', 'propAL'],
    0,
    'rgba(173, 216, 230, 0.2)',
    40,
    'rgba(0, 0, 139, 1)',
    50,
    'rgba(0, 0, 139, 1)',
    100,
    'rgba(0, 0, 139, 1)',
  ],
  'fill-opacity': 1,
  'fill-color-transition': { duration: 500 },
}

export const freguesiaPaintAL: mapboxgl.FillPaint = {
  'fill-color': [
    'interpolate',
    ['linear'],
    ['get', 'diff_alojamentos_2011'],
    0,
    '#98FB98',
    100,
    '#006400',
  ],
  'fill-opacity': 1,
  'fill-color-transition': { duration: 500 },
}

// Map 3
export const seccaoPaint: mapboxgl.FillPaint = {
  'fill-color': ['interpolate', ['linear'], ['get', 'propAL'], 0, '#ADD8E6', 100, '#00008B'],
  'fill-opacity': 0.8,
  'fill-outline-color': '#00008C',
  'fill-color-transition': { duration: 500 },
}
