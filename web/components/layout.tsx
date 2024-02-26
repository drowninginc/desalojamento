import Meta from './meta'
import Header from './header'

type Props = {
  preview?: boolean
  children: React.ReactNode
  language: string
  setLanguage: any
}

const Layout = ({ children, language, setLanguage }: Props) => {
  return (
    <>
      <Meta />
      <Header language={language} setLanguage={setLanguage} />
      <main>{children}</main>
    </>
  )
}

export default Layout
