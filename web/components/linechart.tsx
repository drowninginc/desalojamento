import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { curveLinear } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { Group } from '@visx/group'
import { useSpring, animated } from 'react-spring'
import { ParentSize } from '@visx/responsive'
import { formatNumber } from './extras/helpers'
type Props = {
  language: string
  city: string
  triggerAnimation: boolean
}

const AnimatedLinePath = animated(LinePath)
const AnimatedImage = animated.image

const Linechart = ({ language, city, triggerAnimation }: Props) => {
  const [data, setData] = useState({ Habitacao: [], AL: [] })
  const [startAnimation, setStartAnimation] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      let url = ''
      if (city === 'Porto') {
        url = '/static/data/habitacao.json'
      } else if (city === 'Lisbon') {
        url = '/static/data/habitacao_lisboa.json'
      }
      const response = await fetch(url)
      const newData = await response.json()
      setData(newData)
    }

    fetchData()
  }, [language])

  useEffect(() => {
    if (triggerAnimation) {
      setStartAnimation(true)
    }
  }, [triggerAnimation])

  const margin = { top: 40, right: 30, bottom: 60, left: 30 }

  // Accessors
  const getX = d => d[0]
  const getY = d => d[1]

  return (
    <>
      <div className="chart-legend">
        <div className="legend-item">
          <Image
            src="/static/images/casa_verde.png"
            alt="Número de alojamentos"
            width={40}
            height={30.89}
          />
          {language === 'en' && <span className="legend-text">Number of Housing Units</span>}
          {language !== 'en' && <span className="legend-text">Número de alojamentos</span>}
        </div>
        <div className="legend-item">
          <Image
            src="/static/images/casa_azul_verde.png"
            alt="Número de alojamentos + AL"
            width={40}
            height={30.89}
          />
          {language === 'en' && (
            <span className="legend-text">Number of Housing Units + Local Accomodations</span>
          )}
          {language !== 'en' && <span className="legend-text">Número de alojamentos + AL</span>}
        </div>
      </div>
      <div className="histogram-container">
        <ParentSize>
          {({ width, height }) => {
            // Calculate xScale here
            const xScale = scaleLinear({
              domain: [
                Math.min(...Object.keys(data.Habitacao).map(Number)),
                Math.max(...Object.keys(data.Habitacao).map(Number)),
              ],
              range: [margin.left, width - margin.right],
            })

            const yScale = scaleLinear({
              domain: [
                Math.min(...Object.values(data.Habitacao).map(Number)),
                Math.max(...Object.values(data.Habitacao).map(Number)),
              ],
              range: [height - margin.bottom, margin.top],
            })

            const lineLength = width
            const animationProps = useSpring({
              from: { strokeDashoffset: lineLength, imageOpacity: 0 },
              to: {
                strokeDashoffset: startAnimation ? 0 : lineLength,
                imageOpacity: startAnimation ? 1 : 0,
              }, // Step 3: Use state variable
              config: { duration: 5000 },
              delay: 100,
              reset: true,
              onRest: () => {
                // This callback is called when the animation comes to a still-stand
                // You can use this if you want to chain animations or trigger a state update
              },
            })

            return (
              <svg width={width} height={500}>
                <Group>
                  <AnimatedLinePath
                    data={Object.entries(data.AL)}
                    curve={curveLinear}
                    x={d => xScale(getX(d))}
                    y={d => yScale(getY(d))}
                    stroke={'#012169'}
                    strokeWidth={4}
                    strokeDasharray={lineLength}
                    style={animationProps}
                  />
                  <AnimatedLinePath
                    data={Object.entries(data.Habitacao)}
                    curve={curveLinear}
                    x={d => xScale(getX(d))}
                    y={d => yScale(getY(d))}
                    stroke="#26603a"
                    strokeWidth={4}
                    strokeDasharray={lineLength}
                    style={animationProps}
                  />

                  {Object.entries(data.Habitacao).map((d, i) => (
                    <React.Fragment key={`habitacao-fragment-${i}`}>
                      <AnimatedImage
                        key={`habitacao-image-${i}`}
                        href={'/static/images/casa_verde.png'}
                        x={xScale(getX(d)) - 20}
                        y={yScale(getY(d)) - 20}
                        width="40"
                        height="40"
                        style={{
                          opacity: animationProps.strokeDashoffset.to(offset => {
                            const currentLength = lineLength - offset
                            const pointPosition = xScale(getX(d))
                            const diff = pointPosition - currentLength
                            if (diff <= 0) {
                              return 1
                            }
                            const fadeInDistance = 10
                            if (diff < fadeInDistance) {
                              return 1 - diff / fadeInDistance
                            }
                            return 0
                          }),
                        }}
                      />
                      <animated.text
                        key={`habitacao-label-${i}`}
                        x={xScale(getX(d))}
                        y={yScale(getY(d)) + 30}
                        textAnchor="middle"
                        fill="black"
                        fontSize="14"
                        style={{
                          opacity: animationProps.strokeDashoffset.to(offset => {
                            const currentLength = lineLength - offset
                            const pointPosition = xScale(getX(d))
                            const diff = pointPosition - currentLength
                            if (diff <= 0) {
                              return 1
                            }
                            const fadeInDistance = 10
                            if (diff < fadeInDistance) {
                              return 1 - diff / fadeInDistance
                            }
                            return 0
                          }),
                        }}>
                        {formatNumber(getY(d), language)}
                      </animated.text>
                    </React.Fragment>
                  ))}
                  {Object.entries(data.AL)
                    .slice(4)
                    .map((d, i) => (
                      <React.Fragment key={`AL-fragment-${i}`}>
                        <AnimatedImage
                          key={`al-point-${i + 1}`}
                          href={'/static/images/casa_azul_verde.png'}
                          x={xScale(getX(d)) - 20}
                          y={yScale(getY(d)) - 20}
                          width="40"
                          height="40"
                          style={{
                            opacity: animationProps.strokeDashoffset.to(offset => {
                              const currentLength = lineLength - offset
                              const pointPosition = xScale(getX(d))
                              const diff = pointPosition - currentLength
                              if (diff <= 0) {
                                return 1
                              }
                              const fadeInDistance = 10
                              if (diff < fadeInDistance) {
                                return 1 - diff / fadeInDistance
                              }
                              return 0
                            }),
                          }}
                        />
                        <animated.text
                          key={`habitacao-label-${i}`}
                          x={xScale(getX(d))}
                          y={yScale(getY(d)) - 22}
                          textAnchor="middle"
                          fill="black"
                          fontSize="14"
                          style={{
                            opacity: animationProps.strokeDashoffset.to(offset => {
                              const currentLength = lineLength - offset
                              const pointPosition = xScale(getX(d))
                              const diff = pointPosition - currentLength
                              if (diff <= 0) {
                                return 1
                              }
                              const fadeInDistance = 10
                              if (diff < fadeInDistance) {
                                return 1 - diff / fadeInDistance
                              }
                              return 0
                            }),
                          }}>
                          {formatNumber(getY(d), language)}
                        </animated.text>
                      </React.Fragment>
                    ))}
                  {Object.entries(data.Habitacao).map(d => (
                    <animated.text
                      key={`label-${d}`}
                      x={xScale(getX(d))}
                      y={height}
                      textAnchor="middle"
                      fontSize="20"
                      fill="black"
                      fontWeight="bold"
                      style={{
                        opacity: animationProps.strokeDashoffset.to(offset => {
                          const currentLength = lineLength - offset
                          const pointPosition = xScale(getX(d))
                          const diff = pointPosition - currentLength
                          if (diff <= 0) {
                            return 1
                          }
                          const fadeInDistance = 10
                          if (diff < fadeInDistance) {
                            return 1 - diff / fadeInDistance
                          }
                          return 0
                        }),
                      }}>
                      {d[0]}
                    </animated.text>
                  ))}
                </Group>
              </svg>
            )
          }}
        </ParentSize>
      </div>
    </>
  )
}

export default Linechart
