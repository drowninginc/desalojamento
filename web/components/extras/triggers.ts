import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { cityDefinitions, freguesiaPaint, seccaoPaint, alPaintMegaHost } from './mapStyles'
gsap.registerPlugin(ScrollTrigger)

import { updateMarkerValues } from './helpers'

const setLayerVisibility = (
  city: string,
  map: mapboxgl.Map,
  visibleLayerId: string | null,
  paintProperty?: any,
) => {
  const layers = [`${city}-al`, `${city}-freguesia`, `${city}-seccao`, `${city}-al-megahosts`]
  layers.forEach(layerId => {
    const visibility = layerId === visibleLayerId ? 'visible' : 'none'
    map.setLayoutProperty(layerId, 'visibility', visibility)

    if (layerId === `${city}-freguesia` && visibility === 'visible') {
      map.setPaintProperty(layerId, 'fill-color', paintProperty || freguesiaPaint['fill-color'])
    } else if (layerId === `${city}-seccao` && visibility === 'visible') {
      map.setPaintProperty(layerId, 'fill-color', seccaoPaint['fill-color'])
    } else if (layerId === `${city}-al-megahosts` && visibility === 'visible') {
      map.setPaintProperty(layerId, 'circle-color', alPaintMegaHost['circle-color'])
    }
  })

  if (visibleLayerId != `${city}-al-megahosts`) {
    map.setLayoutProperty(`${city}-al`, 'visibility', 'visible')
    map.setPaintProperty(`${city}-al`, 'circle-opacity', visibleLayerId === `${city}-al` ? 1 : 0.2)
    map.moveLayer(`${city}-al`)
  }
}

export const createScrollTriggers = (
  city,
  map,
  divTrigger,
  mapPin,
  progressBar,
  actionIntro,
  actionFreguesia,
  actionFreguesiaZoom,
  actionFreguesiaPop,
  actionFreguesiaAL,
  actionSeccao,
  actionMegaHosts,
  setNormalizedDate,
  setBarWidth,
  debouncedSetFilter,
  freguesiaPaintPop,
  freguesiaPaintAL,
  markers,
  freguesiaData,
) => {
  ScrollTrigger.create({
    id: 'map-pin',
    trigger: divTrigger.current,
    start: 'top top',
    end: 'bottom top',
    pin: mapPin.current,
  })

  ScrollTrigger.create({
    id: 'progress-bar-pin',
    trigger: divTrigger.current,
    start: 'top top',
    end: 'bottom top',
    pin: progressBar.current,
  })

  ScrollTrigger.create({
    id: 'progress-bar',
    trigger: divTrigger.current,
    start: 'top top',
    endTrigger: actionIntro.current,
    end: 'center center',
    onUpdate: self => {
      const scrollProgress = self.progress
      const dateValue = gsap.utils.clamp(0, 1, scrollProgress)
      setNormalizedDate(dateValue)
      setBarWidth(`${scrollProgress * 100}%`)
      if (map.current) {
        debouncedSetFilter(map.current, dateValue)
      }
    },
    onLeave: () => gsap.to('.progress-bar', { opacity: 0, duration: 0.5, delay: 0.2 }),
    onEnterBack: () => gsap.to('.progress-bar', { opacity: 1, duration: 0.2 }),
  })

  ScrollTrigger.create({
    id: 'plot-full-screen',
    trigger: actionIntro.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 }),
    onEnterBack: () => {
      gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 })
      setLayerVisibility(city, map.current, `${city}-al`)
      markers.forEach(marker => (marker.getElement().style.display = 'none'))
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesia.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
      setLayerVisibility(city, map.current, `${city}-freguesia`)
      markers.forEach(marker => (marker.getElement().style.display = 'block'))
      map.current?.flyTo({ center: map.current.getCenter(), zoom: cityDefinitions[city].zoom })
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`)
      markers.forEach(marker => (marker.getElement().style.display = 'block'))
      updateMarkerValues(markers, freguesiaData, 'propAL')
      map.current?.flyTo({ center: map.current.getCenter(), zoom: cityDefinitions[city].zoom })
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaZoom.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      map.current?.flyTo({
        center: cityDefinitions[city].center.mapCenter,
        zoom: cityDefinitions[city].center.zoom,
      })
    },
    onEnterBack: () => {
      map.current?.flyTo({
        center: cityDefinitions[city].center.mapCenter,
        zoom: cityDefinitions[city].center.zoom,
      })
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaPop.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintPop['fill-color'])
      updateMarkerValues(markers, freguesiaData, 'diff_pop_2011')
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintPop['fill-color'])
      updateMarkerValues(markers, freguesiaData, 'diff_pop_2011')
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaAL.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintAL['fill-color'])
      updateMarkerValues(markers, freguesiaData, 'diff_alojamentos_2011')
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintAL['fill-color'])
      markers.forEach(marker => (marker.getElement().style.display = 'block'))
      updateMarkerValues(markers, freguesiaData, 'diff_alojamentos_2011')
      map.current?.flyTo({
        center: cityDefinitions[city].center.mapCenter,
        zoom: cityDefinitions[city].center.zoom,
      })
    },
  })

  ScrollTrigger.create({
    trigger: actionSeccao.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-seccao`)

      markers.forEach(marker => (marker.getElement().style.display = 'none'))
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-seccao`)

      markers.forEach(marker => (marker.getElement().style.display = 'none'))
    },
  })

  ScrollTrigger.create({
    trigger: actionMegaHosts.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-al-megahosts`)
      map.current?.flyTo({
        center: cityDefinitions[city].mapCenter,
        zoom: cityDefinitions[city].zoom,
      })
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-al-megahosts`)
      map.current?.flyTo({
        center: cityDefinitions[city].mapCenter,
        zoom: cityDefinitions[city].zoom,
      })
    },
  })
}
