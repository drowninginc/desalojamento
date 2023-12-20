import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

type Props = {
  language: string
  setLanguage: any
}

const update = (language: string, setLanguage: any) => {
  setLanguage(language)
  ScrollTrigger.getAll().forEach(trigger => trigger.refresh())
}

const Language = ({ language, setLanguage }: Props) => {
  return (
    <>
      <div className="language-selector">
        <span
          className={language == 'en' ? 'active' : 'language'}
          onClick={() => update('en', setLanguage)}>
          EN
        </span>
        <span>&nbsp;/&nbsp;</span>
        <span
          className={language == 'pt' ? 'active' : 'language'}
          onClick={() => update('pt', setLanguage)}>
          PT
        </span>
      </div>
    </>
  )
}

export default Language
