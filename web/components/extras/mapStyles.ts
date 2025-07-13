import mapboxgl from 'mapbox-gl'

export const cityDefinitions = {
  Porto: {
    boundingBox: [
      [-8.564656, 41.137038],
      [-8.695717, 41.178693],
    ],
    center: {
      boundingBox: [
        [-8.606, 41.133],
        [-8.63, 41.177],
      ],
    },
  },
  Lisbon: {
    boundingBox: [
      [-9.12, 38.8],
      [-9.26, 38.689],
    ],
    center: {
      boundingBox: [
        [-9.187, 38.7],
        [-9.097, 38.744],
      ],
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
  'fill-color': [
    'step',
    ['get', 'propAL'],
    'rgba(0, 0, 0, 0)', // Transparent for values < 50
    90,
    '#012169', // Color for values >= 50
  ],
  'fill-opacity': 1,
  'fill-outline-color': '#00008C',
  'fill-color-transition': { duration: 500 },
}

// Hotels
export const hotelsPaint: mapboxgl.FillPaint = {
  'fill-color': '#012169',
  'fill-opacity': 0.4,
  'fill-outline-color': '#012169',
}
