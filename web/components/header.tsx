import Image from 'next/image'
import Paragraph from './paragraph'
import Language from './language'
import translation from '../libs/translation'
import Link from 'next/link'

import skyImage from './images/sky.png'
import logoImage from './images/desalojamento_logo.png'
import housesImage from './images/houses_porto.png'
import housesShorter from './images/houses_porto_shorter.png'
import lisbonSelector from './images/lisbon_selector.png'
import portoSelector from './images/porto_selector.png'

import { useEffect } from 'react'

type Props = {
  language: string
  setLanguage: any
  city: string
}

const Header = ({ language, setLanguage, city }: Props) => {
  useEffect(() => {
    const layers = document.getElementsByClassName('parallaxLayer')

    function topParallax() {
      const top = window.scrollY
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i] as HTMLElement
        const speed = parseFloat(layer.dataset.speed || '0')
        const yPos = -((top * speed) / 1000)
        layer.style.transform = `translate3d(0, ${yPos}rem, 0)`
      }
    }
    function doParallax() {
      topParallax()
    }

    function handleMouseOver(event: MouseEvent) {
      console.log(event.target)
    }

    window.addEventListener('scroll', doParallax)
    document.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('scroll', doParallax)
      document.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <>
      <header>
        <Language language={language} setLanguage={setLanguage} />
        <div className="parallaxWrapper">
          <div id="layer1" className="parallaxLayer" data-speed="30"></div>
          <div id="layer2" className="parallaxLayer" data-speed="-80">
            <Image className="logo" src={logoImage} alt="Logo Image" layout="responsive"></Image>
            <div className="logoLegend">
              por <a>João Bernardo Narciso</a>
            </div>

            {/* <div className="citySelector">
              <Image
                src={lisbonSelector}
                layout="responsive"
                alt="Lisbon city selector"
                className={city === 'Lisbon' ? 'selected' : 'unselected'}
              />
              <Image
                src={portoSelector}
                layout="responsive"
                alt="Porto city selector"
                className={city === 'Porto' ? 'selected' : 'unselected'}></Image>
            </div> */}
          </div>

          <div id="layer3" className="parallaxLayer">
            <Image src={housesShorter} alt="City landscape image" layout="responsive"></Image>
          </div>
        </div>
        <div className="paragraphWrapper">
          <div className="paragraphIntro o-container">{translation('intro', language, city)}</div>
        </div>
      </header>
    </>
  )
}

export default Header
