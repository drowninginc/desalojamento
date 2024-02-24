import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { json } from 'd3-fetch'

type Data = {
  Habitacao: Record<string, number>
  AL: Record<string, number>
}

type Props = {
  language: string
}

const Linechart = ({ language }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await json<Data>('/static/data/habitacao.json')

      if (!response) {
        return
      }

      const margin = { top: 20, right: 30, bottom: 40, left: 50 }
      const width = 460 - margin.left - margin.right
      const height = 400 - margin.top - margin.bottom

      const svgElement = d3
        .select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(Object.keys(response.Habitacao)) as [number, number])
        .range([0, width])
      const yScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max([...Object.values(response.Habitacao), ...Object.values(response.AL)]) as number,
        ])
        .range([height, 0])

      // Define the lines
      const lineHabitacao = d3
        .line<number>()
        .x((d, i) => xScale(Number(Object.keys(response.Habitacao)[i])))
        .y(d => yScale(d))
      const lineAL = d3
        .line<number>()
        .x((d, i) => xScale(Number(Object.keys(response.AL)[i])))
        .y(d => yScale(d))

      // Draw the lines
      const pathHab = svgElement
        .append('path')
        .datum(Object.values(response.Habitacao))
        .attr('class', 'graph-line line-habitacao')
        .attr('fill', 'none')
        .attr('d', lineHabitacao)

      const pathLength = pathHab.node()!.getTotalLength()

      const transitionPath = d3.transition().ease(d3.easeSin).duration(5000)

      pathHab
        .attr('stroke-dashoffset', pathLength)
        .attr('stroke-dasharray', pathLength)
        .transition(transitionPath)
        .attr('stroke-dashoffset', 0)

      const radius = 8

      svgElement
        .selectAll('.circle-habitacao')
        .data(Object.entries(response.Habitacao))
        .enter()
        .append('circle')
        .attr('class', 'graph-circle circle-habitacao')
        .attr('cx', d => xScale(Number(d[0])))
        .attr('cy', d => yScale(d[1]))
        .attr('r', radius)

      svgElement
        .selectAll('.circle-al')
        .data(Object.entries(response.AL).slice(4))
        .enter()
        .append('circle')
        .attr('class', 'graph-circle circle-al')
        .attr('cx', d => xScale(Number(d[0])))
        .attr('cy', d => yScale(d[1]))
        .attr('r', radius)

      // Add a label with the value
      svgElement
        .selectAll('.label-habitacao')
        .data(Object.entries(response.Habitacao))
        .enter()
        .append('text')
        .attr('class', 'graph-label label-habitacao')
        .attr('x', d => xScale(Number(d[0])))
        .attr('y', d => yScale(d[1]) - 10)
        .text(d => d[1].toString())

      svgElement
        .selectAll('.label-al')
        .data(Object.entries(response.AL))
        .enter()
        .append('text')
        .attr('class', 'graph-label label-al')
        .attr('x', d => xScale(Number(d[0])))
        .attr('y', d => yScale(d[1]) - 10)
        .text(d => d[1].toString())

      svgElement
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
    }

    fetchData()
  }, [language])

  return (
    <div className="histogram-container">
      <h1 className="histogram-title">Habitação e ALs no Porto</h1>
      <svg ref={svgRef} className="histogram-svg"></svg>
    </div>
  )
}

export default Linechart
