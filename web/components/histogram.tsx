import React, { useEffect, useState } from 'react'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { scaleBand, scaleLinear } from '@visx/scale'
import { AxisBottom } from '@visx/axis'

type Datum = {
  year: string
  value: number
}

type Props = {
  language: string
  city: string
}

interface Data {
  Abertura: Record<string, number>
}

const Histogram = ({ language, city }: Props) => {
  const [data, setData] = useState<Datum[]>([])

  let url = ''
  if (city === 'Porto') {
    url = './static/data/datas_abertura_cummulative.json'
  } else if (city === 'Lisbon') {
    url = './static/data/datas_abertura_cummulative.json' //TODO
  }

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then((jsonData: Data) => {
        const dates = Object.entries(jsonData.Abertura).map(([key, value]) => ({
          year: key,
          value: Number(value), // Ensure value is a number
        }))
        setData(dates)
      })
  }, [])

  // Define the graph dimensions and margins
  const width = 600
  const height = 300
  const margin = { top: 20, bottom: 30, left: 20, right: 20 }

  // Then we'll create some bounds
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  // We'll make some helpers to get at the data we want
  const x = (d: Datum) => d.year
  const y = (d: Datum) => +d.value

  // And then scale the graph by our data
  const xScale = scaleBand<string>({
    range: [0, xMax],
    round: true,
    domain: data.map(x),
    padding: 0.4,
  })
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.map(y))],
  })

  // Compose together the scale and accessor functions to get point functions
  const compose = (scale: any, accessor: any) => (data: Datum) => scale(accessor(data))
  const xPoint = compose(xScale, x)
  const yPoint = compose(yScale, y)

  return (
    <div className="histogram-container">
      {language === 'en' && city === 'Porto' && (
        <h1 className="histogram-title">Local Accommodations in Porto, by year</h1>
      )}
      {language === 'pt' && city === 'Porto' && (
        <h1 className="histogram-title">ALs no Porto, por ano</h1>
      )}
      {language === 'en' && city === 'Lisbon' && (
        <h1 className="histogram-title">Local Accommodations in Lisbon, by year</h1>
      )}
      {language === 'pt' && city === 'Lisbon' && (
        <h1 className="histogram-title">ALs em Lisboa, por ano</h1>
      )}
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {data.map((d, i) => {
            const barHeight = yMax - yPoint(d)
            return (
              <Bar
                key={`bar-${i}`}
                x={xPoint(d)}
                y={yMax - barHeight}
                height={barHeight}
                width={xScale.bandwidth()}
                fill="#012169"
              />
            )
          })}
          <AxisBottom top={yMax} scale={xScale} />
        </Group>
      </svg>
    </div>
  )
}

export default Histogram
