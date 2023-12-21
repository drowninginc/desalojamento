import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type Props = {
  language: string
}

const Linechart = ({ language }: Props) => {
  const svg = useRef(null)

  return (
    <div className="histogram-container">
      <h1 className="histogram-title">Habitação e ALs no Porto</h1>
      <svg ref={svg} className="histogram-svg"></svg>
    </div>
  )
}

export default Linechart
