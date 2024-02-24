import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type Props = {
  language: string
}

interface Data {
  Abertura: Record<string, number>
}

const Histogram = ({ language }: Props) => {
  const svg = useRef(null)

  useEffect(() => {
    d3.json<Data>('./static/data/datas_abertura_cummulative.json').then(function (data) {
      const dates = Object.entries(data.Abertura).map(([key, value]) => ({
        year: key,
        value: value,
      }))

      const xScale = d3
        .scaleBand()
        .domain(dates.map(d => d.year))
        .range([0, 600])
        .padding(0.1)
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(dates, d => d.value)])
        .nice()
        .range([300, 0])

      const d3svg = d3.select(svg.current)

      const xAxis = d3.axisBottom(xScale)

      // Append the X axis to the SVG
      d3svg
        .append('g')
        .attr('transform', `translate(0, ${300})`) // Position the axis at the bottom of the SVG
        .call(xAxis)

      d3svg
        .selectAll('rect')
        .data(dates)
        .enter()
        .append('rect')
        .attr('class', 'histogram-rect')
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.value))
        .attr('height', d => 300 - yScale(d.value))
        .attr('width', xScale.bandwidth())

      d3svg
        .selectAll('.histogram-text')
        .data(dates)
        .enter()
        .append('text')
        .attr('class', 'histogram-text')
        .attr('x', d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5) // Adjust this value to position the text correctly
        .text(d => d.value)
        .attr('text-anchor', 'middle')

      // Calculate the maximum value and its corresponding year
      const maxValue = d3.max(dates, d => d.value)
      const maxYear = dates.find(d => d.value === maxValue).year
    })
  }, [])

  return (
    <div className="histogram-container">
      <h1 className="histogram-title">ALs no Porto, por ano</h1>
      <svg ref={svg} className="histogram-svg"></svg>
    </div>
  )
}

export default Histogram
