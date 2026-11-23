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

  // Mirror user choices into the URL so a shared link opens the same city and language
  const setQuery = (key: string, value: string) =>
    router.replace({ query: { ...router.query, [key]: value } }, undefined, {
      shallow: true,
      scroll: false,
    })
  const changeLanguage = (value: string) => {
    setLanguage(value)
    setQuery('language', value)
  }
  // Lisbon has a block Porto doesn't (the 2026 cleanup), so the same scrollY lands elsewhere in
  // the other city. Remember the topmost story block in view and where it is; the map scrolls
  // it back to the same spot once the other city is laid out
  const scrollAnchor = useRef<{ el: Element; top: number } | null>(null)
  const changeCity = (value: string) => {
    const blocks = Array.from(
      document.querySelectorAll('main .text-box, main .full-text-box, main h1, main h2'),
    )
    const i = blocks.findIndex(e => e.getBoundingClientRect().bottom > 0)
    // Reading a block only this city has: the next shared block takes its place
    const el = blocks.slice(Math.max(i, 0)).find(e => !e.closest('[data-city-only]'))
    scrollAnchor.current = el ? { el, top: (blocks[i] ?? el).getBoundingClientRect().top } : null
    setCity(value)
    setQuery('city', value)
  }

  return (
    <>
      <Layout
        language={language}
        setLanguage={changeLanguage}
        city={city}
        setCity={changeCity}
        isMapLoaded={isMapLoaded}
      >
        <Map
          language={language}
          city={city}
          regulationRef={regulationRef}
          scrollAnchor={scrollAnchor}
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
