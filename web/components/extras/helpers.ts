import useSWR from 'swr'
import fetcher from '/libs/fetcher'

export const useData = (path: string) => useSWR<any>(`./static/data/${path}`, fetcher)

export const getMinMax = (data, property) => {
  const values = data.features.map(feature => feature.properties[property])
  return [Math.min(...values), Math.max(...values)]
}

export const getCityData = city => {
  const alData = useData(city + '/al.json').data
  const freguesiaData = useData(city + '/censosFreguesia.json').data
  const seccaoData = useData(city + '/censosSeccao.json').data

  return { alData, freguesiaData, seccaoData }
}
