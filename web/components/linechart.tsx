import { getTranslationString } from '../libs/translation'
import { formatNumber, useData } from './extras/helpers'
import TimeChart from './timechart'

type Props = {
  language: string
  city: string
  triggerAnimation: boolean
}

const HOUSING = { color: '#26603a', width: 3 }
const WITH_AL = { color: '#012169', width: 2, dash: '5 4' } // the AL dots' colour

// Housing stock per census (Habitacao), and what it would be if the homes now in AL were still
// housing (AL). The gap between the two is shaded and is the point of the chart
const Linechart = ({ language, city, triggerAnimation }: Props) => {
  const { data } = useData(city === 'Porto' ? 'habitacao.json' : 'habitacao_lisboa.json')
  const t = (key: string) => getTranslationString(key, language, city)
  const format = (v: number) => formatNumber(v, language)

  const years = data ? Object.keys(data.Habitacao) : []
  const last = years[years.length - 1]
  // The shaded gap starts at the last census where both series were still equal
  const start = Math.max(0, years.findIndex(yr => data.AL[yr] !== data.Habitacao[yr]) - 1)

  return (
    <>
      {data && (
        <TimeChart
          series={[
            {
              key: 'al',
              ...WITH_AL,
              icon: '/static/images/casa_azul_verde.png',
              iconFrom: Number(years[start + 1]),
              data: data.AL,
            },
            {
              key: 'housing',
              ...HOUSING,
              icon: '/static/images/casa_verde.png',
              data: data.Habitacao,
            },
          ]}
          format={format}
          label={t('linechart-title')}
          drawn={triggerAnimation}
          behind={({ x, y }) => {
            const gap = years.slice(start)
            const top = gap.map(yr => `${x(Number(yr))},${y(data.AL[yr])}`)
            const bottom = [...gap].reverse().map(yr => `${x(Number(yr))},${y(data.Habitacao[yr])}`)
            return <path className="housing-gap" d={`M${[...top, ...bottom].join('L')}Z`} />
          }}
        />
      )}
      <ul className="chart-legend">
        <li>
          <span style={{ background: HOUSING.color }} />
          {t('linechart-label-1')}
        </li>
        {data && (
          <li>
            <span className="chart-legend__gap" />
            {t('linechart-label-2')
              .replace('{n}', format(data.AL[last] - data.Habitacao[last]))
              .replace('{year}', last)}
          </li>
        )}
      </ul>
    </>
  )
}

export default Linechart
