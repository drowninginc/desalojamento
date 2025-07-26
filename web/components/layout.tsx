import Meta from './meta'
import Header from './header'

type Props = {
  preview?: boolean
  children: React.ReactNode
  language: string
  setLanguage: any
  city: string
  setCity: any
}

const Layout = ({ children, language, setLanguage, city, setCity }: Props) => {
  return (
    <>
      <Meta />
      <Header language={language} setLanguage={setLanguage} city={city} setCity={setCity} />
      <main>{children}</main>
    </>
  )
}

export default Layout
