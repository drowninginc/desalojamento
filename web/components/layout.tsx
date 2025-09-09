import Meta from './meta'
import Header from './header'

type Props = {
  preview?: boolean
  children: React.ReactNode
  language: string
  setLanguage: any
  city: string
  setCity: any
  isMapLoaded: boolean
}

const Layout = ({ children, language, setLanguage, city, setCity, isMapLoaded }: Props) => {
  return (
    <>
      <Meta />
      <Header
        language={language}
        setLanguage={setLanguage}
        city={city}
        setCity={setCity}
        isMapLoaded={isMapLoaded}
      />
      <main>{children}</main>
    </>
  )
}

export default Layout
