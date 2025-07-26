import Image from 'next/image'
import Language from './language'
import translation, { getTranslationString } from '../libs/translation'

import logoImage from './images/desalojamento_logo.png'
import housesShorter from './images/houses_porto_shorter.png'
import ALPlaque from './images/ALBlock.png'

import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

type Props = {
  language: string
  setLanguage: any
  city: string
  setCity: any
}

const Header = ({ language, setLanguage, city, setCity }: Props) => {
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

    window.addEventListener('scroll', doParallax)

    // Add ALPlaque at random positions on layer3 every second
    const layer3 = document.getElementById('layer3')
    let plaqueCount = 0
    const intervalId = setInterval(() => {
      if (layer3 && plaqueCount < 50) {
        const plaqueWrapper = document.createElement('div')
        plaqueWrapper.style.position = 'absolute'
        plaqueWrapper.style.width = '50px'
        plaqueWrapper.style.height = '50px'
        plaqueWrapper.style.top = `${Math.random() * 30 + 15}%`
        plaqueWrapper.style.left = `${Math.random() * 85 + 5}%`
        layer3.appendChild(plaqueWrapper)

        const root = createRoot(plaqueWrapper)
        root.render(<Image src={ALPlaque} alt="AL Plaque" layout="fill" objectFit="contain" />)

        plaqueCount++
      } else {
        clearInterval(intervalId)
      }
    }, 1500)

    return () => {
      window.removeEventListener('scroll', doParallax)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <>
      <header>
        <Language language={language} setLanguage={setLanguage} />
        <div className="parallaxWrapper">
          <div id="layer1" className="parallaxLayer" data-speed="30"></div>
          <div id="layer2" className="parallaxLayer" data-speed="-80">
            <Image
              className="logo"
              src={logoImage}
              alt="Logo Image"
              layout="responsive"
              priority={true}></Image>
            <div className="logoLegend">
              por{' '}
              <a href="https://www.linkedin.com/in/joaobernardonarciso/">João Bernardo Narciso</a>
            </div>

            <div className="introDescription">Alguns dados e mapas sobre o Alojamento Local</div>

            <div className="citySelector">
              <button
                className={city === 'Lisbon' ? 'active' : ''}
                onClick={() => setCity('Lisbon')}
                type="button">
                Lisbon
              </button>
              <button
                className={city === 'Porto' ? 'active' : ''}
                onClick={() => setCity('Porto')}
                type="button">
                Porto
              </button>
            </div>
          </div>

          <div id="layer3" className="parallaxLayer">
            <Image src={housesShorter} alt="City landscape image" layout="responsive"></Image>
          </div>
        </div>
        <div className="paragraphWrapper">
          <div
            className="paragraphIntro o-container"
            dangerouslySetInnerHTML={{
              __html: getTranslationString('intro', language, city),
            }}
          />
        </div>
      </header>
    </>
  )
}

export default Header
