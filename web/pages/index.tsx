import Layout from '../components/layout'
import Map from '../components/map'
import GhostHotels from '../components/ghostHotels'

import { useState } from 'react'

const Index = () => {
  const [language, setLanguage] = useState('pt')
  const city = 'Lisbon'

  return (
    <>
      <Layout language={language} setLanguage={setLanguage} city={city}>
        <Map language={language} city={city} />
        <GhostHotels language={language} city={city} />
      </Layout>
    </>
  )
}

export default Index
