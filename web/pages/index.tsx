import Layout from '../components/layout'
import Map from '../components/map'
import GhostHotels from '../components/ghostHotels'
import Footer from '../components/footer'
import Regulation from '../components/regulation'

import { useState, useRef } from 'react'

const Index = () => {
  const [language, setLanguage] = useState('pt')
  const [city, setCity] = useState('Lisbon')
  const regulationRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <Layout language={language} setLanguage={setLanguage} city={city} setCity={setCity}>
        <Map language={language} city={city} regulationRef={regulationRef} />
        <GhostHotels language={language} city={city} />
        <Regulation language={language} city={city} ref={regulationRef} />
      </Layout>
      <Footer language={language} city={city} />
    </>
  )
}

export default Index
