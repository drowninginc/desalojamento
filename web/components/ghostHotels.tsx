import Container from './container'
import Paragraph from './paragraph'
import translation from '../libs/translation'
import Image from 'next/image'

type Props = {
  language: string
  city: string
}

const GhostHotels = ({ language, city }: Props) => {
  return (
    <Container className="ghostHotels">
      <h1>Alojamento Local ou Hotel-Fantasma?</h1>
      <div className="paragraphIntro">{translation('actionManagers-1', language, city)}</div>
      <Image
        src="/static/images/torneseproprietario.png"
        alt="Proprietário"
        width={1374}
        height={736}
        priority
      />
      <div className="image-legend">
        {translation('source', language, city)}{' '}
        <a href="https://www.liiiving.pt" target="_blank" rel="noopener noreferrer">
          Liiiving
        </a>
      </div>
      <div className="paragraphIntro">{translation('actionManagers-2', language, city)}</div>
      <Image
        id="servicos"
        src="/static/images/servicos.png"
        alt="Serviços"
        width={2190}
        height={788}
        priority
      />
      <div className="image-legend">
        {translation('source', language, city)}{' '}
        <a href="https://www.lovelystay.com" target="_blank" rel="noopener noreferrer">
          Lovely Stay
        </a>
      </div>
    </Container>
  )
}

export default GhostHotels
