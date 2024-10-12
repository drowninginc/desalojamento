import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { debounce } from 'lodash'
import Casas from './casas'
import Linechart from './linechart'

import {
  cityDefinitions,
  alPaint,
  alPaintMegaHost,
  freguesiaPaint,
  seccaoPaint,
} from './extras/mapStyles'
import {
  getCityData,
  getMinMax,
  createMap,
  addSourcesAndLayers,
  addCentroidMarkers,
} from './extras/helpers'
import { createScrollTriggers } from './extras/triggers'

// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2xhdWRpb2xlbW9zIiwiYSI6ImNsMDV4NXBxajBzMWkzYm9ndXhzbTk5ZHkifQ.85n9mjZbTDUpyQZrrJTBwA'

type Props = {
  city: string
  language: string
}

const Map = ({ language, city }: Props) => {
  const { alData, freguesiaData, seccaoData } = getCityData(city)
  const divTrigger = React.useRef(null!)
  const mapPin = React.useRef(null!)
  const mapContainer = React.useRef(null!)
  const progressBar = React.useRef(null!)
  const map = useRef<mapboxgl.Map | null>(null)

  const actionIntro = React.useRef(null!)
  const actionFreguesia = React.useRef(null!)
  const actionFreguesiaZoom = React.useRef(null!)
  const actionFreguesiaPop = React.useRef(null!)
  const actionFreguesiaAL = React.useRef(null!)
  const actionSeccao = React.useRef(null!)
  const actionLineChart = React.useRef(null!)
  const actionMegaHosts = React.useRef(null!)

  const [normalizedDate, setNormalizedDate] = React.useState(0)
  const [barWidth, setBarWidth] = React.useState('0%')
  const [triggerAnimation, setTriggerAnimation] = React.useState(false)
  const [triggerMegaHostAnimation, setTriggerMegaHostAnimation] = React.useState(false)

  const [boundaryBox, setBoundaryBox] = React.useState<[number, number][]>([])

  const formatDate = value => {
    const startDate = new Date('2014-01-01')
    const endDate = new Date('2023-11-15')
    const timeRange = endDate.valueOf() - startDate.valueOf()
    const date = new Date(startDate.getTime() + value * timeRange)
    return date.toLocaleDateString('pt-pt', { year: 'numeric', month: 'long' })
  }

  gsap.registerPlugin(ScrollTrigger)

  const debouncedSetFilter = debounce((map, dateValue) => {
    map.setFilter(`${city}-al`, ['<=', ['get', 'normalized_date'], dateValue])
  }, 10)

  useEffect(() => {
    const checkMapLoaded = () => {
      if (map.current && map.current.loaded()) {
        document.body.style.overflow = 'scroll'
      } else {
        document.body.style.overflow = 'scroll'
        setTimeout(checkMapLoaded, 400)
      }
    }

    if (alData && freguesiaData && seccaoData) {
      if (map.current) return

      const [minPop, maxPop] = getMinMax(freguesiaData, 'diff_pop_2011')
      const [minAloj, maxAloj] = getMinMax(freguesiaData, 'diff_alojamentos_2011')
      const freguesiaPaintPop: mapboxgl.FillPaint = {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'diff_pop_2011'],
          minPop,
          '#b3589a', // Vivid red for the most negative values
          0,
          '#FFFFFF', // White for zero
          maxPop,
          '#b8ffcb', // Green for the most positive values
        ],
        'fill-opacity': 0.1,
        'fill-color-transition': { duration: 500 },
      }

      const freguesiaPaintAL: mapboxgl.FillPaint = {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'diff_alojamentos_2011'],
          minAloj,
          '#b3589a', // Vivid red for the most negative values
          0,
          '#FFFFFF', // White for zero
          maxAloj,
          '#b8ffcb', // Dark green for the most positive values
        ],
        'fill-opacity': 0.1,
        'fill-color-transition': { duration: 500 },
      }

      map.current = createMap(mapContainer.current, city, cityDefinitions, setBoundaryBox)

      map.current.on('load', () => {
        console.log(freguesiaData)
        const centroidMarkers = addCentroidMarkers(map.current, freguesiaData, [
          'propAL',
          'diff_alojamentos_2011',
          'diff_pop_2011',
        ])

        createScrollTriggers(
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
          centroidMarkers,
          setTriggerAnimation,
          setBoundaryBox,
          setTriggerMegaHostAnimation,
        )

        addSourcesAndLayers(
          city,
          map.current,
          alData,
          freguesiaData,
          seccaoData,
          alPaint,
          freguesiaPaint,
          seccaoPaint,
          alPaintMegaHost,
        )
      })
    }

    checkMapLoaded()

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [alData])

  const useResize = handler => {
    useEffect(() => {
      window.addEventListener('resize', handler)

      return () => {
        window.removeEventListener('resize', handler)
      }
    }, [handler])
  }

  const onResize = useCallback(() => {
    if (map.current) {
      map.current.resize()
      setTimeout(() => {
        map.current.resize()
        map.current.fitBounds([
          [boundaryBox[0][0], boundaryBox[0][1]],
          [boundaryBox[1][0], boundaryBox[1][1]],
        ])
      }, 500) // Ensure fitBounds is called after resize
    }
  }, [map.current, boundaryBox])

  useResize(onResize)

  return (
    <>
      <div className="whole-container">
        <div ref={progressBar} className="progress-bar">
          <div className="progress-fill" style={{ width: barWidth }}>
            <div className="progress-fill-text" style={{ width: barWidth }}>
              {formatDate(normalizedDate)}
            </div>
          </div>
          {formatDate(normalizedDate)}
        </div>

        <div className="plot-full-screen"></div>

        <div ref={mapPin} className="map-content">
          <div ref={mapContainer} className="map-container" />
        </div>

        <div ref={divTrigger} className="text-boxes-container">
          <div className="text-box glassy">
            A figura jurídica do alojamento local foi introduzida em 2008. Só em 2014 passou a ser
            obrigatório o seu registo, integrando-se na designação os alojamentos que já operavam.
          </div>
          <div className="text-box glassy">
            Desde então, a oferta de AL não tem parado de crescer.
            <div className="text-box-note">
              <div className="text-box-note-text">
                O tamanho dos círculos é proporcional ao número de ALs por número de porta
              </div>
              <svg className="circle-legend-svg" width="22.66" height="21.66">
                <circle className="circleBig" cx="11.33" cy="11.33" r="10.33" />
                <circle className="circleSmall" cx="11.33" cy="16" r="5" />
              </svg>
            </div>
          </div>
          <div className="text-box glassy">
            Em novembro de 2023, já tinham sido atribuídas mais de 10 mil licenças de alojamento
            local só na cidade do Porto.
          </div>
          <div className="text-box glassy">
            O ritmo de novas licenças tem estado quase sempre em crescimento, com exceção dos anos
            da COVID-19. Cada novo ano tem batido recordes de novos alojamentos. Só em 2022, foram
            registadas 1914 novas licenças, 20% do total das licenças até à data.
          </div>
          <div ref={actionIntro} className="text-box glassy">
            actionIntro
          </div>
          <div ref={actionFreguesia} className="text-box glassy">
            Embora o fenómeno se espalhe até às cidades periféricas, nem todas as zonas da cidade
            são afetadas da mesma forma.
            <div className="heatmap-label">
              <span className="label-center">rácio de alojamentos locais por habitação</span>
              <div className="heatmap-rectangle heatmap-al"></div>
              <div className="heatmap-labels">
                <span className="label-left">menos AL</span>
                <span className="label-right">mais AL</span>
              </div>
            </div>
          </div>
          <div ref={actionFreguesiaZoom} className="text-box glassy">
            As freguesias do Centro Histórico são as mais afetadas.
          </div>
          <div ref={actionFreguesiaAL} className="text-box glassy">
            As freguesias com maior concentração de ALs são precisamente as que perderam mais
            habitação na última década.
            <div className="heatmap-label">
              <span className="label-center">
                Evolução do número de alojamentos para habitação permanente (%) 2011-2021
              </span>
              <div className="heatmap-rectangle heatmap-population">
                <div className="category category-1"></div>
                <div className="category category-2"></div>
                <div className="category category-3"></div>
                <div className="category category-4"></div>
              </div>
              <div className="heatmap-labels">
                <span className="label-left">menos habitação</span>
                <span className="label-right">mais habitação</span>
              </div>
            </div>
          </div>
          <div ref={actionFreguesiaPop} className="text-box glassy">
            E também as que perderam mais população.
            <div className="heatmap-label">
              <span className="label-center">Evolução do número de habitantes (%) 2011-2021</span>
              <div className="heatmap-rectangle heatmap-population"></div>
              <div className="heatmap-labels">
                <span className="label-left">menos habitantes</span>
                <span className="label-right">mais habitantes</span>
              </div>
            </div>
          </div>
          <div ref={actionLineChart} className="text-box glassy">
            O padrão blablabla{' '}
            <Linechart
              language={language}
              city={city}
              triggerAnimation={triggerAnimation}></Linechart>
          </div>
          <div ref={actionSeccao} className="text-box glassy">
            O mapa por quarteirões permite perceber melhor a concentração de ALs em alguns locais da
            cidade, que se tornaram verdadeiros oásis da monocultura do turismo.
          </div>
          <div ref={actionMegaHosts} className="text-box glassy">
            actionMegaHosts
            <Casas
              percentage={60}
              title={'Proporção de ALs cujos donos são proprietários de múltiplos alojamentos'}
              triggerAnimation={triggerMegaHostAnimation}></Casas>
            <Casas
              percentage={45}
              title={'Proporção de ALs detidos por empresas'}
              triggerAnimation={triggerMegaHostAnimation}></Casas>
          </div>
        </div>
      </div>
    </>
  )
}

export default Map
