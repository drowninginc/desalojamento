import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { curveLinear } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { scaleLinear } from '@visx/scale'
import { Group } from '@visx/group'
import { useSpring, animated } from 'react-spring'

type Props = {
  language: string
  city: string
}

const AnimatedLinePath = animated(LinePath)
const AnimatedImage = animated.image

const Linechart = ({ language, city }: Props) => {
  const [data, setData] = useState({ Habitacao: [], AL: [] })

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

  const width = 700
  const height = 450
  const margin = { top: 20, right: 80, bottom: 60, left: 50 }

  // Accessors
  const getX = d => d[0]
  const getY = d => d[1]

  // Scales
  const xScale = scaleLinear({
    domain: [
      Math.min(...Object.keys(data.Habitacao).map(Number)),
      Math.max(...Object.keys(data.Habitacao).map(Number)),
    ],
    range: [margin.left, width - margin.right],
  })

  const yScale = scaleLinear({
    domain: [90000, 150000],
    range: [height - margin.bottom, margin.top],
  })

  const lineLength = width
  const animationProps = useSpring({
    from: { strokeDashoffset: lineLength, imageOpacity: 0 },
    to: { strokeDashoffset: 0, imageOpacity: 1 },
    config: { duration: 10000 }, // Adjust the duration as needed
    delay: 500, // Delay the start of the animation as needed
    reset: true, // Add this if you want the animation to reset when the data changes
    onRest: () => {
      // This callback is called when the animation comes to a still-stand
      // You can use this if you want to chain animations or trigger a state update
    },
  })

  return (
    <div className="histogram-container">
      <h1 className="histogram-title">Habitação e ALs no Porto</h1>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
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
                    const currentLength = lineLength - offset // Current drawn length of the line
                    const pointPosition = xScale(getX(d)) // X position of the data point
                    // Calculate the difference between the point position and the current length of the line
                    const diff = pointPosition - currentLength
                    // If the line has reached the point, start increasing opacity
                    if (diff <= 0) {
                      return 1 // Fully visible if the line has passed the point
                    }
                    // If the line is about to reach the point, increase opacity based on proximity
                    const fadeInDistance = 10 // Adjust this value to control the "speed" of the fade-in
                    if (diff < fadeInDistance) {
                      return 1 - diff / fadeInDistance // Calculate opacity based on how close the line is to the point
                    }
                    return 0 // Fully transparent if the line is not close to the point yet
                  }),
                }}
              />
              <animated.text
                key={`habitacao-label-${i}`}
                x={xScale(getX(d))}
                y={yScale(getY(d)) + 30} // Adjust the y position to place the label above the image
                textAnchor="middle" // Centers the text horizontally around (x, y)
                fill="black" // Text color
                fontSize="14" // Text size
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
                {getY(d)}
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
                  x={xScale(getX(d)) - 20} // Adjust the x position to center the image on the data point
                  y={yScale(getY(d)) - 20} // Adjust the y position to center the image on the data point
                  width="40" // Set the width of the image
                  height="40" // Set the height of the image
                  style={{
                    opacity: animationProps.strokeDashoffset.to(offset => {
                      const currentLength = lineLength - offset // Current drawn length of the line
                      const pointPosition = xScale(getX(d)) // X position of the data point
                      // Calculate the difference between the point position and the current length of the line
                      const diff = pointPosition - currentLength
                      // If the line has reached the point, start increasing opacity
                      if (diff <= 0) {
                        return 1 // Fully visible if the line has passed the point
                      }
                      // If the line is about to reach the point, increase opacity based on proximity
                      const fadeInDistance = 10 // Adjust this value to control the "speed" of the fade-in
                      if (diff < fadeInDistance) {
                        return 1 - diff / fadeInDistance // Calculate opacity based on how close the line is to the point
                      }
                      return 0 // Fully transparent if the line is not close to the point yet
                    }),
                  }}
                />
                <animated.text
                  key={`habitacao-label-${i}`}
                  x={xScale(getX(d))}
                  y={yScale(getY(d)) - 22} // Adjust the y position to place the label above the image
                  textAnchor="middle" // Centers the text horizontally around (x, y)
                  fill="black" // Text color
                  fontSize="14" // Text size
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
                  {getY(d)}
                </animated.text>
              </React.Fragment>
            ))}
          {Object.entries(data.Habitacao).map((d, i) => (
            <animated.text
              key={`label-${d}`}
              x={xScale(getX(d))}
              y={height - 50} // Position the labels at the bottom of the chart
              textAnchor="middle"
              fontSize="20" // Adjust font size as needed
              fill="black" // Adjust the fill color as needed
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
      <div className="chart-legend">
        <div className="legend-item">
          <Image
            src="/static/images/casa_verde.png"
            alt="Número de alojamentos"
            width="50.5"
            height="39"
          />
          {language === 'en' && <span className="legend-text">Number of Housing Units</span>}
          {language !== 'en' && <span className="legend-text">Número de Alojamentos</span>}
        </div>
        <div className="legend-item">
          <Image
            src="/static/images/casa_azul_verde.png"
            alt="Número de alojamentos + AL"
            width="50.5"
            height="39"
          />
          {language === 'en' && (
            <span className="legend-text">Number of Housing Units + Local Accomodations</span>
          )}
          {language !== 'en' && <span className="legend-text">Número de Alojamentos + AL</span>}
        </div>
      </div>
    </div>
  )
}

export default Linechart
