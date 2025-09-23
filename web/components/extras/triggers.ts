import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { cityDefinitions, freguesiaPaint, alPaintMegaHost, hotelsPaint } from './mapStyles'
gsap.registerPlugin(ScrollTrigger)

import {
  updateMarkerValues,
  setMarkerVisibility,
  changeBoundaryBox,
  abortMarkerAnimations,
} from './helpers'

const setLayerVisibility = (
  city: string,
  map: mapboxgl.Map,
  visibleLayerId: string | null,
  paintProperty?: any,
) => {
  const layers = [`${city}-al`, `${city}-freguesia`, `${city}-al-megahosts`]
  layers.forEach(layerId => {
    const visibility = layerId === visibleLayerId ? 'visible' : 'none'
    map.setLayoutProperty(layerId, 'visibility', visibility)

    if (layerId === `${city}-freguesia` && visibility === 'visible') {
      map.setPaintProperty(layerId, 'fill-color', paintProperty || freguesiaPaint['fill-color'])
    } else if (layerId === `${city}-al-megahosts` || layerId === `${city}-al`) {
      if (visibility === 'visible') {
        if (layerId === `${city}-al-megahosts`) {
          map.setPaintProperty(layerId, 'circle-color', alPaintMegaHost['circle-color'])
        }
        map.setPaintProperty(layerId, 'circle-opacity', 1)
      } else {
        // Prepare layer to fade in next time by keeping opacity at 0
        map.setPaintProperty(layerId, 'circle-opacity', 0)
      }
    }
  })

  if (visibleLayerId != `${city}-al-megahosts`) {
    map.setLayoutProperty(`${city}-al`, 'visibility', 'visible')
    map.setPaintProperty(`${city}-al`, 'circle-opacity', visibleLayerId === `${city}-al` ? 1 : 0.2)
    map.moveLayer(`${city}-al`)
  }
}

export const createScrollTriggers = (
  isMobile,
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
  actionRooms,
  actionMegaHosts,
  actionFullAirbnb,
  actionMap3,
  setNormalizedDate,
  setBarWidth,
  debouncedSetFilter,
  freguesiaPaintPop,
  freguesiaPaintAL,
  markers,
  setTriggerAnimation,
  setBoundaryBox,
  setTriggerMegaHostAnimation,
  imageWrappers,
  regulationSection,
  actionLastRegulationZoom,
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
    id: 'al-count',
    trigger: divTrigger.current,
    start: 'top top',
    endTrigger: actionIntro.current,
    end: 'center center',
    onEnter: () => gsap.to('.al-count', { opacity: 1, duration: 0.3 }),
    onLeave: () => gsap.to('.al-count', { opacity: 0, duration: 0.3 }),
    onEnterBack: () => gsap.to('.al-count', { opacity: 1, duration: 0.3 }),
    onLeaveBack: () => gsap.to('.al-count', { opacity: 0, duration: 0.3 }),
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
        debouncedSetFilter(map.current, dateValue, city)
      }
    },
    onEnter: () => {
      gsap.to('.progress-bar', { opacity: 1, duration: 0.5, delay: 0.2 })
      gsap.to('.city-switcher-wrapper', {
        opacity: 1,
        transform: isMobile ? 'translateX(-50%) translateY(0px)' : 'translateY(0px)',
        duration: 0.6,
        delay: 0.2,
        ease: 'back.out(1.7)',
      })
      // Sequential animation: help-bubble appears after city-switcher
      gsap.to('.help-bubble', {
        opacity: 1,
        duration: 0.5,
        delay: 0.8, // 0.2 (city-switcher delay) + 0.6 (city-switcher duration)
        ease: 'power2.out',
      })
    },
    onLeave: () => {
      gsap.to('.progress-bar', { opacity: 0, duration: 0.5, delay: 0.2 })
    },
    onEnterBack: () => {
      gsap.to('.progress-bar', { opacity: 1, duration: 0.2 })
    },
    onLeaveBack: () => {
      gsap.to('.progress-bar', { opacity: 0, duration: 0.5, delay: 0.2 })
      // Kill any ongoing help-bubble animations and hide it first, then city-switcher
      gsap.killTweensOf('.help-bubble')
      gsap.to('.help-bubble', {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        ease: 'power2.in',
      })
      gsap.to('.city-switcher-wrapper', {
        opacity: 0,
        transform: isMobile ? 'translateX(-50%) translateY(120px)' : 'translateY(120px)',
        duration: 0.4,
        delay: 0.2,
        ease: 'back.in(1.2)',
      })
    },
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
      abortMarkerAnimations(markers)
      setMarkerVisibility(markers, 'none')
    },
  })

  ScrollTrigger.create({
    id: 'last-regulation-zoom',
    trigger: actionLastRegulationZoom.current,
    start: 'top 70%',
    end: 'top 20%',
    onLeave: () => {
      changeBoundaryBox(
        map.current,
        setBoundaryBox,
        isMobile
          ? cityDefinitions[city].center.boundingBoxMobile
          : cityDefinitions[city].center.boundingBox,
      )
    },
    onEnterBack: () => {
      changeBoundaryBox(
        map.current,
        setBoundaryBox,
        isMobile ? cityDefinitions[city].boundingBoxMobile : cityDefinitions[city].boundingBox,
      )
    },
  })

  ScrollTrigger.create({
    id: 'hotels-visibility',
    trigger: actionIntro.current,
    start: 'top 95%',
    end: 'top 20%',

    onEnter: () => {
      // Make AL points a bit faded by reducing their opacity
      // Set the circle-opacity property for the AL layer to 0.3 (or adjust as needed)
      if (map.current.getLayer(`${city}-al`)) {
        map.current.setPaintProperty(`${city}-al`, 'circle-opacity', 0.1)
      }
      if (map.current.getLayer(`${city}-hotels`)) {
        map.current.setPaintProperty(`${city}-hotels`, 'fill-opacity', 1)
      }
    },
    onEnterBack: () => {
      console.log('onEnterBack')
      // Use setTimeout to ensure this runs after other triggers that might override the opacity
      setTimeout(() => {
        if (map.current.getLayer(`${city}-al`)) {
          map.current.setPaintProperty(`${city}-al`, 'circle-opacity', 0.1)
        }
        if (map.current.getLayer(`${city}-hotels`)) {
          map.current.setPaintProperty(`${city}-hotels`, 'fill-opacity', 1)
        }
      }, 10)
    },
    onLeave: () => {
      if (map.current.getLayer(`${city}-al`)) {
        map.current.setPaintProperty(`${city}-al`, 'circle-opacity', 1)
      }
      if (map.current.getLayer(`${city}-hotels`)) {
        map.current.setPaintProperty(`${city}-hotels`, 'fill-opacity', hotelsPaint['fill-opacity'])
      }
    },
    onLeaveBack: () => {
      if (map.current.getLayer(`${city}-hotels`)) {
        map.current.setPaintProperty(`${city}-hotels`, 'fill-opacity', 0)
      }
      if (map.current.getLayer(`${city}-al`)) {
        map.current.setPaintProperty(`${city}-al`, 'circle-opacity', 1)
      }
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
      setMarkerVisibility(markers, 'block', true)
    },
    onEnterBack: () => {
      gsap.to('.plot-full-screen', { opacity: 0, duration: 0.5 })
      updateMarkerValues(markers, ['propAL'])
    },
  })

  ScrollTrigger.create({
    trigger: actionFreguesiaZoom.current,
    start: 'top 70%',
    end: 'top 20%',
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
      setLayerVisibility(city, map.current, `${city}-freguesia`, freguesiaPaintPop['fill-color'])
      updateMarkerValues(markers, ['propAL', 'diff_alojamentos_2011', 'diff_pop_2011'])
      setMarkerVisibility(markers, 'block')
    },
  })

  // City switcher visibility control for actionMap3
  ScrollTrigger.create({
    trigger: actionMap3.current,
    start: 'top 80%',
    end: 'top 20%',
    onEnter: () => {
      // Kill any ongoing help-bubble animations and hide it
      gsap.killTweensOf('.help-bubble')
      gsap.to('.help-bubble', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
    },
    onLeaveBack: () => {
      // Show help-bubble
      gsap.to('.help-bubble', {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      })
    },
  })

  // City switcher visibility control for actionFullAirbnb
  ScrollTrigger.create({
    trigger: actionFullAirbnb.current,
    start: 'top bottom',
    end: 'top bottom',
    onEnter: () => {
      gsap.to('.city-switcher-wrapper', {
        opacity: 0,
        transform: isMobile ? 'translateX(-50%) translateY(120px)' : 'translateY(120px)',
        duration: 0.4,
        delay: 0.2,
        ease: 'back.in(1.2)',
      })
    },
    onLeaveBack: () => {
      gsap.to('.city-switcher-wrapper', {
        opacity: 1,
        transform: isMobile ? 'translateX(-50%) translateY(0px)' : 'translateY(0px)',
        duration: 0.6,
        delay: 0.2,
        ease: 'back.out(1.7)',
      })
    },
  })

  if (actionFullAirbnb.current) {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: actionFullAirbnb.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true,
        onEnter: () => {
          setLayerVisibility(city, map.current, `${city}-al`)
          if (map.current.getLayer(`${city}-hotels`)) {
            map.current.setPaintProperty(`${city}-hotels`, 'fill-opacity', 0)
          }

          setMarkerVisibility(markers, 'none')
          changeBoundaryBox(
            map.current,
            setBoundaryBox,
            isMobile ? cityDefinitions[city].boundingBoxMobile : cityDefinitions[city].boundingBox,
          )
        },
        onLeave: () => {
          setLayerVisibility(city, map.current, `${city}-al`)
          setMarkerVisibility(markers, 'none')
          changeBoundaryBox(
            map.current,
            setBoundaryBox,
            isMobile ? cityDefinitions[city].boundingBoxMobile : cityDefinitions[city].boundingBox,
          )
        },
        onEnterBack: () => {
          if (map.current && map.current.getLayer(`${city}-al`)) {
            map.current.setFilter(`${city}-al`, null)
          }
          setLayerVisibility(
            city,
            map.current,
            `${city}-freguesia`,
            freguesiaPaintPop['fill-color'],
          )
          setMarkerVisibility(markers, 'block')
          changeBoundaryBox(
            map.current,
            setBoundaryBox,
            isMobile
              ? cityDefinitions[city].center.boundingBoxMobile
              : cityDefinitions[city].center.boundingBox,
          )
        },
        onLeaveBack: () => {
          if (map.current.getLayer(`${city}-hotels`)) {
            map.current.setPaintProperty(
              `${city}-hotels`,
              'fill-opacity',
              hotelsPaint['fill-opacity'],
            )
          }

          setLayerVisibility(
            city,
            map.current,
            `${city}-freguesia`,
            freguesiaPaintPop['fill-color'],
          )
          setMarkerVisibility(markers, 'block')
          changeBoundaryBox(
            map.current,
            setBoundaryBox,
            isMobile
              ? cityDefinitions[city].center.boundingBoxMobile
              : cityDefinitions[city].center.boundingBox,
          )
        },
      },
    })

    // Add animation for timeline-order-first
    timeline.to('.timeline-order-first', { opacity: 1, y: 0, duration: 1 })

    imageWrappers.forEach((wrapperRef, index) => {
      if (wrapperRef.current) {
        timeline.to(wrapperRef.current, { opacity: 1, y: 0, duration: 1 }, index + 1)
      }
    })

    // Add animation for timeline-order-final
    timeline.to('.timeline-order-final', { opacity: 1, y: 0, duration: 1 })
  }

  ScrollTrigger.create({
    trigger: actionRooms.current,
    start: 'top 90%',
    end: 'top 20%',
    onEnter: () => {
      setLayerVisibility(city, map.current, `${city}-al`)
      // Show only rooms (Quartos)
      if (map.current && map.current.getLayer(`${city}-al`)) {
        map.current.setFilter(`${city}-al`, ['==', ['get', 'modalidade'], 'Quartos'])
      }
    },

    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-al`)
      // Show only rooms (Quartos)
      if (map.current && map.current.getLayer(`${city}-al`)) {
        map.current.setFilter(`${city}-al`, ['==', ['get', 'modalidade'], 'Quartos'])
      }
    },
  })

  ScrollTrigger.create({
    trigger: actionMegaHosts.current,
    start: 'top 90%',
    end: 'top 20%',
    onEnter: () => {
      setTriggerMegaHostAnimation(true)
      setLayerVisibility(city, map.current, `${city}-al-megahosts`)
      gsap.to('.footer', { opacity: 1, duration: 0.5 })
      gsap.to('.language-selector', { display: 'none', duration: 0.5 })
    },
    onEnterBack: () => {
      setLayerVisibility(city, map.current, `${city}-al-megahosts`)
      changeBoundaryBox(
        map.current,
        setBoundaryBox,
        isMobile ? cityDefinitions[city].boundingBoxMobile : cityDefinitions[city].boundingBox,
      )
    },

    onLeaveBack: () => {
      gsap.to('.footer', { opacity: 0, duration: 0.5 })
      gsap.to('.language-selector', { display: 'block', duration: 0.5 })
    },
  })

  // Regulation section scroll triggers
  if (regulationSection && regulationSection.current) {
    // Create triggers for each regulation item (1-6)
    for (let i = 1; i <= 6; i++) {
      const itemSel = `.reg-item--${i}`
      const houseSel = `.reg-house--${i}`
      const blueSel = `${houseSel} .reg-house__img--blue`
      const greenSel = `${houseSel} .reg-house__img--green`
      const textSel = `.reg-textbox--${i}`

      ScrollTrigger.create({
        id: `regulation-${i}`,
        trigger: itemSel,
        start: 'top 80%',
        end: 'top 20%',
        onEnter: () => {
          gsap.to(textSel, { opacity: 1, y: 0, duration: 0.6, ease: 'power1.out' })
          gsap.to(blueSel, { opacity: 0, duration: 0.3, ease: 'power1.out' })
          gsap.to(greenSel, { opacity: 1, duration: 0.3, ease: 'power1.out' })
        },
        onEnterBack: () => {
          gsap.to(textSel, { opacity: 1, y: 0, duration: 0.6, ease: 'power1.out' })
          gsap.to(blueSel, { opacity: 0, duration: 0.3, ease: 'power1.out' })
          gsap.to(greenSel, { opacity: 1, duration: 0.3, ease: 'power1.out' })
        },
        onLeaveBack: () => {
          gsap.to(textSel, { opacity: 0, y: 20, duration: 0.4, ease: 'power1.in' })
          gsap.to(blueSel, { opacity: 1, duration: 0.25, ease: 'power1.in' })
          gsap.to(greenSel, { opacity: 0, duration: 0.25, ease: 'power1.in' })
        },
      })
    }
  }
}
