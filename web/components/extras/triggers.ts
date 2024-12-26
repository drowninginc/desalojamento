import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { cityDefinitions, freguesiaPaint, seccaoPaint, alPaintMegaHost } from './mapStyles'
gsap.registerPlugin(ScrollTrigger)

import { updateMarkerValues, setMarkerVisibility, changeBoundaryBox } from './helpers'

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
  actionLineChart,
  actionSeccao,
  actionMegaHosts,
  setNormalizedDate,
  setBarWidth,
  debouncedSetFilter,
  freguesiaPaintPop,
  freguesiaPaintAL,
  markers,
  setTriggerAnimation,
  setBoundaryBox,
  setTriggerMegaHostAnimation,
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
    onEnter: () => gsap.to('.progress-bar', { opacity: 1, duration: 0.5, delay: 0.2 }),
    onLeave: () => gsap.to('.progress-bar', { opacity: 0, duration: 0.5, delay: 0.2 }),
    onEnterBack: () => gsap.to('.progress-bar', { opacity: 1, duration: 0.2 }),
    onLeaveBack: () => gsap.to('.progress-bar', { opacity: 0, duration: 0.5, delay: 0.2 }),
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
      setMarkerVisibility(markers, 'none')
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesia.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
      setLayerVisibility(city, map.current, `${city}-freguesia`)
      updateMarkerValues(markers, ['propAL'])
      setMarkerVisibility(markers, 'block')
      changeBoundaryBox(map.current, setBoundaryBox, cityDefinitions[city].boundingBox)
    },
    onEnterBack: () => {
      gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
      updateMarkerValues(markers, ['propAL'])
      changeBoundaryBox(map.current, setBoundaryBox, cityDefinitions[city].boundingBox)
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaZoom.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      changeBoundaryBox(map.current, setBoundaryBox, cityDefinitions[city].center.boundingBox)
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`)
      updateMarkerValues(markers, ['propAL'])
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaAL.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintAL['fill-color'])
      updateMarkerValues(markers, ['propAL', 'diff_alojamentos_2011'])
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintAL['fill-color'])
      updateMarkerValues(markers, ['propAL', 'diff_alojamentos_2011'])
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaPop.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintPop['fill-color'])
      updateMarkerValues(markers, ['propAL', 'diff_alojamentos_2011', 'diff_pop_2011'])
    },
  })

  ScrollTrigger.create({
    trigger: actionLineChart.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setTriggerAnimation(true)
    },
    onEnterBack: () => {
      setTriggerAnimation(true)
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintPop['fill-color'])
      updateMarkerValues(markers, ['propAL', 'diff_alojamentos_2011', 'diff_pop_2011'])
      setMarkerVisibility(markers, 'block')
    },
  })

  ScrollTrigger.create({
    trigger: actionSeccao.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-seccao`)
      setMarkerVisibility(markers, 'none')
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-seccao`)
      setMarkerVisibility(markers, 'none')
      changeBoundaryBox(map.current, setBoundaryBox, cityDefinitions[city].center.boundingBox)
    },
  })

  ScrollTrigger.create({
    trigger: actionMegaHosts.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-al-megahosts`)
      changeBoundaryBox(map.current, setBoundaryBox, cityDefinitions[city].boundingBox)
      setTriggerMegaHostAnimation(true)
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-al-megahosts`)
      changeBoundaryBox(map.current, setBoundaryBox, cityDefinitions[city].boundingBox)
      setTriggerMegaHostAnimation(true)
    },
  })

  ScrollTrigger.create({
    trigger: '.images-container',
    start: 'top 50%', // Adjust start position as needed
    end: 'bottom 20%', // Adjust end position as needed
    markers: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to('.images-container .image-wrapper:nth-child(1)', { opacity: 1, duration: 0.5 })
        .to('.images-container .image-wrapper:nth-child(2)', { opacity: 1, duration: 0.5 }, '+=0.3')
        .to('.images-container .image-wrapper:nth-child(3)', { opacity: 1, duration: 0.5 }, '+=0.3')
    },
    onEnterBack: () => {
      const tl = gsap.timeline()
      tl.to('.images-container .image-wrapper:nth-child(1)', { opacity: 1, duration: 0.5 })
        .to('.images-container .image-wrapper:nth-child(2)', { opacity: 1, duration: 0.5 }, '+=0.3')
        .to('.images-container .image-wrapper:nth-child(3)', { opacity: 1, duration: 0.5 }, '+=0.3')
    },
    onLeave: () => gsap.to('.images-container .image-wrapper', { opacity: 0, duration: 0.5 }),
    onLeaveBack: () => gsap.to('.images-container .image-wrapper', { opacity: 0, duration: 0.5 }),
  })
}
