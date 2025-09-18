import Layout from '../components/layout'
import Map from '../components/map'
import GhostHotels from '../components/ghostHotels'
import Footer from '../components/footer'
import Regulation from '../components/regulation'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'

const Index = () => {
  const router = useRouter()

  // Get language and city from URL parameters, with fallbacks
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined' && router.query.language) {
      return router.query.language as string
    }
    return 'pt' // fallback
  }

  const getInitialCity = () => {
    if (typeof window !== 'undefined' && router.query.city) {
      return router.query.city as string
    }
    return 'Lisbon' // fallback
  }

  const [language, setLanguage] = useState(getInitialLanguage())
  const [city, setCity] = useState(getInitialCity())
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const regulationRef = useRef<HTMLDivElement>(null)

  // Update state when router query changes
  useEffect(() => {
    if (router.isReady) {
      if (router.query.language && router.query.language !== language) {
        setLanguage(router.query.language as string)
      }
      if (router.query.city && router.query.city !== city) {
        setCity(router.query.city as string)
      }
    }
  }, [router.isReady, router.query.language, router.query.city])

  return (
    <>
      <Layout
        language={language}
        setLanguage={setLanguage}
        city={city}
        setCity={setCity}
        isMapLoaded={isMapLoaded}>
        <Map
          language={language}
          city={city}
          regulationRef={regulationRef}
          onMapLoad={setIsMapLoaded}
        />
        <GhostHotels language={language} city={city} />
        <Regulation language={language} city={city} ref={regulationRef} />
      </Layout>
      <Footer language={language} city={city} />
    </>
  )
}

export default Index
