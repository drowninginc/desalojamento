import Image from 'next/image'
import Language from './language'
import translation from '../libs/translation'
import ReactDOM from 'react-dom'

import logoImage from './images/desalojamento_logo.png'
import housesShorter from './images/houses_porto_shorter.png'
import ALPlaque from './images/ALBlock.png'

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

    window.addEventListener('scroll', doParallax)

    // Add ALPlaque at random positions on layer3 every second
    const layer3 = document.getElementById('layer3')
    const intervalId = setInterval(() => {
      if (layer3) {
        const plaqueWrapper = document.createElement('div')
        plaqueWrapper.style.position = 'absolute'
        plaqueWrapper.style.width = '50px' // Adjust size as needed
        plaqueWrapper.style.height = '50px' // Adjust size as needed
        plaqueWrapper.style.top = `${Math.random() * 30 + 10}%`
        plaqueWrapper.style.left = `${Math.random() * 90 + 5}%`
        layer3.appendChild(plaqueWrapper)

        // Use Next.js Image component
        ReactDOM.render(
          <Image src={ALPlaque} alt="AL Plaque" layout="fill" objectFit="contain" />,
          plaqueWrapper,
        )
      }
    }, 1000) // Every second

    return () => {
      window.removeEventListener('scroll', doParallax)
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
