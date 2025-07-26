import Layout from '../components/layout'
import Map from '../components/map'
import GhostHotels from '../components/ghostHotels'

import { useState } from 'react'

const Index = () => {
  const [language, setLanguage] = useState('pt')
  const [city, setCity] = useState('Lisbon')

  return (
    <>
      <Layout language={language} setLanguage={setLanguage} city={city} setCity={setCity}>
        <Map language={language} city={city} />
        <GhostHotels language={language} city={city} />
      </Layout>
    </>
  )
}

export default Index
