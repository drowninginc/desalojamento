import Image from 'next/image'
import Paragraph from '../components/paragraph'
import Language from '../components/language'
import translation from '../libs/translation'

type Props = {
  language: string
  setLanguage: any
  city: string
}

const Header = ({ language, setLanguage, city }: Props) => {
  return (
    <header>
      <Language language={language} setLanguage={setLanguage} />
      <div className="title-image">
        <Image
          src="/static/images/header_porto.png"
          alt="Desalojamento Local"
          width="1778px"
          height="644px"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,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"
        />
      </div>
      <Paragraph>{translation('intro', language, city)}</Paragraph>
    </header>
  )
}

export default Header
