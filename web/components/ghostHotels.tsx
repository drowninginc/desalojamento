import Container from './container'
import Paragraph from './paragraph'
import { getTranslationString } from '../libs/translation'
import Image from 'next/image'

type Props = {
  language: string
  city: string
}

const GhostHotels = ({ language, city }: Props) => {
  return (
    <Container className="ghostHotels">
      <h1>{getTranslationString('actionManagers-title', language, city)}</h1>
      <div className="paragraphIntro">
        {getTranslationString('actionManagers-1', language, city)}
      </div>
      <Image
        src={`/static/images/torneseproprietario${language === 'en' ? '_en' : ''}.png`}
        alt="Proprietário"
        width={1374}
        height={736}
        priority
      />
      <div className="image-legend">
        {getTranslationString('source', language, city)}{' '}
        <a href="https://www.liiiving.pt" target="_blank" rel="noopener noreferrer">
          Liiiving
        </a>
      </div>
      <Image
        id="servicos"
        src={`/static/images/servicos${language === 'en' ? '_en' : ''}.png`}
        alt="Serviços"
        width={2190}
        height={788}
        priority
      />
      <div className="image-legend">
        {getTranslationString('source', language, city)}{' '}
        <a href="https://www.lovelystay.com" target="_blank" rel="noopener noreferrer">
          Lovely Stay
        </a>
      </div>
      <div
        className="paragraphIntro"
        dangerouslySetInnerHTML={{
          __html: getTranslationString('actionManagers-2', language, city),
        }}
      />
    </Container>
  )
}

export default GhostHotels
