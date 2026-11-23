import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

type Props = {
  language: string
  setLanguage: (language: string) => void
  city: string
}

const update = (language: string, setLanguage: Props['setLanguage']) => {
  setLanguage(language)
  // Defer refresh until after the DOM reflows with new text sizes
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  })
}

// Real links, so the toggle is keyboard-reachable and each language has its own URL
const Language = ({ language, setLanguage, city }: Props) => {
  const option = (code: string) => (
    <a
      href={`?language=${code}&city=${city}`}
      lang={code}
      hrefLang={code}
      className={language === code ? 'active' : 'language'}
      aria-current={language === code ? 'true' : undefined}
      onClick={e => {
        e.preventDefault()
        update(code, setLanguage)
      }}
    >
      {code.toUpperCase()}
    </a>
  )

  return (
    <nav className="language-selector" aria-label="Language">
      {option('en')}
      <span aria-hidden="true">&nbsp;/&nbsp;</span>
      {option('pt')}
    </nav>
  )
}

export default Language
