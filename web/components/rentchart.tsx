import { getTranslationString } from '../libs/translation'
import { useData } from './extras/helpers'
import TimeChart from './timechart'

type Props = {
  language: string
  city: string
}

const HIGH = { color: '#012169', width: 2.5 } // the AL dots' colour
const MEDIAN = { color: '#c0392b', width: 3.5 }
// Mais Habitação's AL measures: in force Oct 2023 – Nov 2024, shaded as the 2023–2024 stretch
const MAIS_HABITACAO = [2023, 2024]

// Median rent of new lease contracts (€/m², INE), 2020–2025: the city's, and that of the
// parishes with more than 10% AL. Data from final_python/rendas.py
const RentChart = ({ language, city }: Props) => {
  const { data } = useData('rents.json')
  const cityData = data?.[city]
  const t = (key: string) => getTranslationString(key, language, city)
  const euros = (v: number) => `${v.toLocaleString(language === 'en' ? 'en-GB' : 'pt-PT')} €`

  return (
    <div className="rent-chart">
      <h3 className="chart-title">{t('rents-chart-title')}</h3>
      {cityData && (
        <TimeChart
          series={[
            { key: 'high', ...HIGH, data: cityData.high },
            { key: 'median', ...MEDIAN, data: cityData.median },
          ]}
          format={euros}
          label={t('rents-chart-label')}
          fromZero
          margin={{ top: 50, right: 70, bottom: 30, left: 70 }}
          behind={({ x, y, margin }) => (
            // Mais Habitação: a band behind the lines, labelled above the plot
            <g className="rent-chart__event">
              <rect
                x={x(MAIS_HABITACAO[0])}
                y={margin.top}
                width={x(MAIS_HABITACAO[1]) - x(MAIS_HABITACAO[0])}
                height={y(0) - margin.top}
              />
              <text textAnchor="middle">
                {['Programa', 'Mais Habitação'].map((line, i) => (
                  <tspan
                    key={line}
                    x={(x(MAIS_HABITACAO[0]) + x(MAIS_HABITACAO[1])) / 2}
                    y={margin.top - 26 + i * 15}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )}
        />
      )}
      <ul className="chart-legend">
        <li>
          <span style={{ background: MEDIAN.color }} />
          {t('rents-legend-median')}
        </li>
        <li>
          <span style={{ background: HIGH.color }} />
          {t('rents-legend-high')}
        </li>
      </ul>
    </div>
  )
}

export default RentChart
