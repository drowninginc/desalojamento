import { ParentSize } from '@visx/responsive'
import { scaleLinear } from '@visx/scale'
import { LinePath } from '@visx/shape'
import { ReactNode, useEffect, useId, useRef, useState } from 'react'
import { animated, useSpring } from 'react-spring'

export type Series = {
  key: string
  color: string
  width: number
  dash?: string
  icon?: string // image drawn on each data point (from iconFrom on), instead of a hover dot
  iconFrom?: number
  data: Record<string, number>
}
const ICON = 22
type Margin = { top: number; right: number; bottom: number; left: number }
export type Scales = {
  x: (year: number) => number
  y: (value: number) => number
  margin: Margin
}

type Props = {
  series: Series[] // drawn in this order, the last on top
  format: (value: number) => string
  label: string // aria-label
  fromZero?: boolean // y axis from 0 with a labelled baseline; otherwise labelled gridlines
  margin?: Margin
  drawn?: boolean // false hides the lines, true draws them left to right; omitted: on scrolling into view
  behind?: (scales: Scales) => ReactNode // bands and areas under the lines
}

// Yearly lines with values at both ends and, on hover (or tap), at the nearest data point.
// Used by the housing stock and rents charts
const TimeChart = ({
  series,
  format,
  label,
  fromZero = false,
  margin = { top: 20, right: 70, bottom: 30, left: 70 },
  drawn,
  behind,
}: Props) => {
  const [hover, setHover] = useState<number | null>(null)
  // Drawn once at least half of the chart has scrolled into view (when the caller doesn't say)
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (drawn !== undefined || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.disconnect()
      },
      { threshold: 0.5 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [drawn])
  const { p } = useSpring({ p: drawn ?? inView ? 1 : 0, config: { duration: 5000 }, delay: 100 })
  const clipId = useId()

  return (
    <div className="histogram-container time-chart" ref={ref}>
      <ParentSize>
        {({ width, height }) => {
          if (width === 0) return null
          const years = Object.keys(series[0].data).map(Number)
          const lastYear = years[years.length - 1]
          const all = series.flatMap(s => Object.values(s.data))
          const x = scaleLinear({
            domain: [years[0], lastYear],
            range: [margin.left, width - margin.right],
          })
          const y = scaleLinear({
            domain: [fromZero ? 0 : Math.min(...all), Math.max(...all)],
            range: [height - margin.bottom, margin.top],
            nice: true,
          })
          const bottom = y.range()[0]
          // Value labels sit beside the points, clear of the icons when there are any
          const pad = series.some(s => s.icon) ? 4 + ICON / 2 : 6
          // One year's values, top to bottom, pushed apart when close; equal values shown once
          // (in the colour of the line drawn on top)
          const labels = (year: number) =>
            [...series]
              .reverse()
              .map(s => ({ ...s, value: s.data[year] }))
              .filter((s, i, a) => a.findIndex(o => format(o.value) === format(s.value)) === i)
              .sort((a, b) => b.value - a.value)
              .reduce((acc, s) => {
                const prev = acc[acc.length - 1]
                return [...acc, { ...s, ly: Math.max(y(s.value), prev ? prev.ly + 16 : -Infinity) }]
              }, [])
          const valueLabels = (year: number, lx: number, anchor: string, dy = 0) =>
            labels(year).map(s => (
              <text
                key={`${year}-${s.key}`}
                className="time-chart__value"
                x={lx}
                y={s.ly + dy}
                dy="0.32em"
                textAnchor={anchor}
                fill={s.color}
              >
                {format(s.value)}
              </text>
            ))
          // Gridline labels that would collide with the first year's values are left out
          const firstYs = labels(years[0]).map(s => s.ly)
          // Hover snaps to the nearest year with data (censuses are ten years apart)
          const pickYear = (e: React.PointerEvent<SVGRectElement>) => {
            const px = e.clientX - e.currentTarget.ownerSVGElement.getBoundingClientRect().left
            setHover(years.reduce((a, b) => (Math.abs(x(b) - px) < Math.abs(x(a) - px) ? b : a)))
          }

          return (
            <svg width={width} height={height} role="img" aria-label={label}>
              <clipPath id={clipId}>
                <animated.rect x={0} y={0} height={height} width={p.to(v => v * width)} />
              </clipPath>
              {y.ticks(4).map(v => (
                <g key={v} className="time-chart__grid">
                  <line x1={margin.left} x2={width - margin.right} y1={y(v)} y2={y(v)} />
                  {!fromZero && firstYs.every(ly => Math.abs(ly - y(v)) > 14) && (
                    <text x={margin.left - 6} y={y(v)} dy="0.32em" textAnchor="end">
                      {format(v)}
                    </text>
                  )}
                </g>
              ))}
              {fromZero && (
                <g className="time-chart__baseline">
                  <line x1={margin.left} x2={width - margin.right} y1={bottom} y2={bottom} />
                  <text x={margin.left - 6} y={bottom} dy="0.32em" textAnchor="end">
                    {format(0)}
                  </text>
                </g>
              )}
              {/* Every year when there's room for it, otherwise just the first and last */}
              {(x(years[1]) - x(years[0]) >= 40 ? years : [years[0], lastYear]).map(yr => (
                <text
                  key={yr}
                  className="time-chart__year"
                  x={x(yr)}
                  y={bottom + 18}
                  textAnchor="middle"
                >
                  {yr}
                </text>
              ))}
              <g clipPath={`url(#${clipId})`}>
                {behind?.({ x, y, margin })}
                {series.map(s => (
                  <LinePath
                    key={s.key}
                    data={Object.entries(s.data)}
                    x={([yr]) => x(Number(yr))}
                    y={([, v]) => y(v)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.width}
                    strokeDasharray={s.dash}
                  />
                ))}
                {series.map(
                  s =>
                    s.icon &&
                    years
                      .filter(yr => yr >= (s.iconFrom ?? years[0]))
                      .map(yr => (
                        <image
                          key={`${s.key}-${yr}`}
                          href={s.icon}
                          x={x(yr) - ICON / 2}
                          y={y(s.data[yr]) - ICON / 2}
                          width={ICON}
                          height={ICON}
                        />
                      )),
                )}
              </g>
              {valueLabels(years[0], x(years[0]) - pad, 'end')}
              <animated.g style={{ opacity: p.to(v => (v === 1 ? 1 : 0)) }}>
                {valueLabels(lastYear, x(lastYear) + pad, 'start')}
              </animated.g>
              {hover !== null && (
                <g className="time-chart__hover">
                  {series
                    .filter(s => !s.icon)
                    .map(s => (
                      <circle
                        key={s.key}
                        cx={x(hover)}
                        cy={y(s.data[hover])}
                        r={4.5}
                        fill={s.color}
                      />
                    ))}
                  {hover !== years[0] &&
                    hover !== lastYear &&
                    valueLabels(hover, x(hover) - pad - 2, 'end', -10)}
                  <text
                    className="time-chart__year"
                    x={x(hover)}
                    y={bottom + 18}
                    textAnchor="middle"
                  >
                    {hover}
                  </text>
                </g>
              )}
              {/* Hover area: the nearest year to the pointer. Touch keeps the last tapped year */}
              <rect
                x={margin.left - 20}
                y={0}
                width={width - margin.left - margin.right + 40}
                height={height}
                fill="transparent"
                onPointerMove={pickYear}
                onPointerDown={pickYear}
                onPointerLeave={e => e.pointerType === 'mouse' && setHover(null)}
              />
            </svg>
          )
        }}
      </ParentSize>
    </div>
  )
}

export default TimeChart
