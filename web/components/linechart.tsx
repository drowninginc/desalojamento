import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type Props = {
  language: string
}

const Linechart = ({ language }: Props) => {
  const svg = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/static/data/habitacao.json');
      const data = await response.json();

      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const width = 460 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svgElement = d3.select(svg.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleLinear()
        .domain(d3.extent(Object.keys(data.Habitacao)))
        .range([0, width]);
      const yScale = d3.scaleLinear()
        .domain([0, d3.max([...Object.values(data.Habitacao), ...Object.values(data.AL)])])
        .range([height, 0]);

      // Define the lines
      const lineHabitacao = d3.line()
        .x((d, i) => xScale(Object.keys(data.Habitacao)[i]))
        .y((d) => yScale(d));
      const lineAL = d3.line()
        .x((d, i) => xScale(Object.keys(data.AL)[i]))
        .y((d) => yScale(d));

      // Draw the lines
      const pathHab = svgElement.append("path")
        .datum(Object.values(data.Habitacao))
        .attr("class", "graph-line")
        .attr("class", "line-habitacao")
        .attr("fill", "none")
        .attr("d", lineHabitacao);

      // const pathAL = svgElement.append("path")
      //   .datum(Object.values(data.AL))
      //   .attr("class", "graph-line")
      //   .attr("class", "line-al")
      //   .attr("fill", "none")
      //   .attr("stroke", "none")
      //   .attr("d", lineAL);

      const pathLength = pathHab.node().getTotalLength();

      const transitionPath = d3
        .transition()
        .ease(d3.easeSin)
        .duration(5000);

        pathHab
        .attr("stroke-dashoffset", pathLength)
        .attr("stroke-dasharray", pathLength)
        .transition(transitionPath)
        .attr("stroke-dashoffset", 0);


  const radius = 8;
  function repeatTransitionHabitacao(selection) {
    selection
      .transition()
      .delay(10000)
      .attr("r", 0) // Reset to radius 0
      .on("end", () => repeatTransitionHabitacao(selection)); // Repeat the transition
  }

  const circlesHabitacao = svgElement.selectAll(".circle-habitacao")
    .data(Object.entries(data.Habitacao))
    .enter().append("circle")
      .attr("class", "graph-circle")
      .attr("class", "circle-habitacao")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 0)
      .transition() // Start a transition
      .delay((d, i) => i * 1000) // Delay each circle's animation based on its index
      .attr("r", radius);



  const circlesAL = svgElement.selectAll(".circle-al")
    .data(Object.entries(data.AL).slice(4))
    .enter().append("circle")
      .attr("class", "graph-circle")
      .attr("class", "circle-al")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 0)
      .transition() // Start a transition
      .delay((d, i) => i * 5000) // Delay each circle's animation based on its index
      .attr("r", radius);

  // Add a label with the value
  svgElement.selectAll(".label-habitacao")
    .data(Object.entries(data.Habitacao))
    .enter().append("text")
      .attr("class", "graph-label")
      .attr("class", "label-habitacao")
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]) - 10)
      .text(d => d[1])

  svgElement.selectAll(".label-al")
    .data(Object.entries(data.AL))
    .enter().append("text")
      .attr("class", "graph-label")
      .attr("class", "label-al")
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]) - 10)
      .text(d => d[1])

      svgElement.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    };

    fetchData();
  }, [language]);







  return (
    <div className="histogram-container">
      <h1 className="histogram-title">Habitação e ALs no Porto</h1>
      <svg ref={svg} className="histogram-svg"></svg>
    </div>
  )
}

export default Linechart
