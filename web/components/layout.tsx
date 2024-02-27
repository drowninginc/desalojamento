import Meta from './meta'
import Header from './header'

type Props = {
  preview?: boolean
  children: React.ReactNode
  language: string
  setLanguage: any
  city: string
}

const Layout = ({ children, language, setLanguage, city }: Props) => {
  return (
    <>
      <Meta />
      <Header language={language} setLanguage={setLanguage} city={city} />
      <main>{children}</main>
    </>
  )
}

export default Layout
