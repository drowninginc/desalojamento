import Image from 'next/image'
import Paragraph from './paragraph'
import Language from './language'
import translation from '../libs/translation'

import skyImage from './images/sky.png'
import logoImage from './images/desalojamento_logo.png'
import housesImage from './images/houses_porto.png'

type Props = {
  language: string
  setLanguage: any
  city: string
}

const Header = ({ language, setLanguage, city }: Props) => {
  return (
    <header>
      <Language language={language} setLanguage={setLanguage} />
      {/*       <div className="title-image">
        <Image
          src={`/static/images/header_${city.toLowerCase()}.png`}
          alt="Desalojamento Local"
          width="1778px"
          height="644px"
          placeholder="blur"
        />
      </div>
      <div className="image-container">
        <Image
          src={`/static/images/azulejos2.jpg`}
          className="full-width-image"
          layout="fill"
          objectFit="cover"
        />

        <div className="logo glassy">
          {' '}
          <div className="logo-text">
            <span className="cooper-bold first-line">DL</span>
            <span className="cooper-bold second-line">(Desalojamento Local)</span>
          </div>
        </div>
      </div>
      */}

      <div className="background">
        <Image src={skyImage}></Image>
        <div className="logo">
          <Image src={logoImage}></Image>
        </div>
      </div>
      <div className="foreground">
        <Image src={housesImage}></Image>
      </div>

      <Paragraph>{translation('intro', language, city)}</Paragraph>
    </header>
  )
}

export default Header
