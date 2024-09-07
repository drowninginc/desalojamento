import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { freguesiaPaint, seccaoPaint, alPaintMegaHost, freguesiaPaintAL } from './mapStyles'
gsap.registerPlugin(ScrollTrigger)

const setLayerVisibility = (
  map: mapboxgl.Map,
  visibleLayerId: string | null,
  paintProperty?: any,
) => {
  const layers = ['porto-al', 'porto-freguesia', 'porto-seccao', 'porto-al-megahosts']
  layers.forEach(layerId => {
    const visibility = layerId === visibleLayerId ? 'visible' : 'none'
    map.setLayoutProperty(layerId, 'visibility', visibility)

    if (layerId === 'porto-freguesia' && visibility === 'visible') {
      map.setPaintProperty(layerId, 'fill-color', paintProperty || freguesiaPaint['fill-color'])
    } else if (layerId === 'porto-seccao' && visibility === 'visible') {
      map.setPaintProperty(layerId, 'fill-color', seccaoPaint['fill-color'])
    } else if (layerId === 'porto-al-megahosts' && visibility === 'visible') {
      map.setPaintProperty(layerId, 'circle-color', alPaintMegaHost['circle-color'])
    }
  })

  if (visibleLayerId != 'porto-al-megahosts') {
    map.setLayoutProperty('porto-al', 'visibility', 'visible')
    map.setPaintProperty('porto-al', 'circle-opacity', visibleLayerId === 'porto-al' ? 1 : 0.2)
    map.moveLayer('porto-al')
  }
}

export const createScrollTriggers = (
  map,
  divTrigger,
  mapPin,
  progressBar,
  actionIntro,
  actionFreguesia,
  actionFreguesiaPop,
  actionFreguesiaAL,
  actionSeccao,
  actionMegaHosts,
  setNormalizedDate,
  setBarWidth,
  debouncedSetFilter,
  freguesiaPaintPop,
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
    onLeave: () => gsap.to('.progress-bar', { opacity: 0, duration: 0.5, delay: 0.5 }),
    onEnterBack: () => gsap.to('.progress-bar', { opacity: 1, duration: 0.5, delay: 0.5 }),
  })

  ScrollTrigger.create({
    id: 'plot-full-screen',
    trigger: actionIntro.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 }),
    onEnterBack: () => {
      gsap.to('.plot-full-screen', { opacity: 1, duration: 0.5 })
      setLayerVisibility(map.current, 'porto-al')
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesia.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
      setLayerVisibility(map.current, 'porto-freguesia')
    },
    onEnterBack: () => {
      setLayerVisibility(map.current, 'porto-freguesia')
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaPop.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(map.current, 'porto-freguesia', freguesiaPaintPop['fill-color'])
    },
    onEnterBack: () => {
      setLayerVisibility(map.current, 'porto-freguesia', freguesiaPaintPop['fill-color'])
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaAL.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(map.current, 'porto-freguesia', freguesiaPaintAL['fill-color'])
    },
    onEnterBack: () => {
      setLayerVisibility(map.current, 'porto-freguesia', freguesiaPaintAL['fill-color'])
    },
  })

  ScrollTrigger.create({
    trigger: actionSeccao.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(map.current, 'porto-seccao')
    },
    onEnterBack: () => {
      setLayerVisibility(map.current, 'porto-seccao')
    },
  })

  ScrollTrigger.create({
    trigger: actionMegaHosts.current,
    start: 'top 70%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(map.current, 'porto-al-megahosts')
    },
    onEnterBack: () => {
      setLayerVisibility(map.current, 'porto-al-megahosts')
    },
  })
}
