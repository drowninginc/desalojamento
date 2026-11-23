import Image from 'next/image'
import Language from './language'
import { getTranslationString } from '../libs/translation'

import logoImage from './images/desalojamento_logo.png'
import housesShorter from './images/houses_porto_shorter.png'
import ALPlaque from './images/ALBlock.png'

import { useEffect, useState } from 'react'

type Props = {
  language: string
  setLanguage: any
  city: string
  setCity: any
  isMapLoaded?: boolean
}

const Header = ({ language, setLanguage, city, setCity, isMapLoaded = false }: Props) => {
  const [showArrow, setShowArrow] = useState(false)

  // Show arrow after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // AL plaques pop up on the skyline, one per second, at random spots (client-only, so no
  // hydration mismatch)
  const [plaques, setPlaques] = useState<{ top: number; left: number }[]>([])
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaques(p => {
        if (p.length >= 30) {
          clearInterval(intervalId)
          return p
        }
        return [...p, { top: Math.random() * 30 + 15, left: Math.random() * 85 + 5 }]
      })
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const layers = document.getElementsByClassName('parallaxLayer')
    let frame: number | null = null

    const doParallax = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        const top = window.scrollY
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i] as HTMLElement
          const speed = parseFloat(layer.dataset.speed || '0')
          layer.style.transform = `translate3d(0, ${-((top * speed) / 1000)}rem, 0)`
        }
      })
    }

    window.addEventListener('scroll', doParallax, { passive: true })
    window.addEventListener('resize', doParallax)

    return () => {
      window.removeEventListener('scroll', doParallax)
      window.removeEventListener('resize', doParallax)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  // Track previous selection for animation
  useEffect(() => {
    const switcher = document.querySelector('.city-switcher') as HTMLElement
    if (!switcher) return

    const trackPrevious = (el: HTMLElement) => {
      const radios = el.querySelectorAll('input[type="radio"]')
      let previousValue = null

      // Find already selected radio on initialization
      const initiallyChecked = el.querySelector(
        'input[type="radio"]:checked',
      ) as HTMLInputElement | null
      if (initiallyChecked) {
        previousValue = initiallyChecked.getAttribute('c-option')
        el.setAttribute('c-previous', previousValue || '')
      }

      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          if ((radio as HTMLInputElement).checked) {
            el.setAttribute('c-previous', previousValue ?? '')
            previousValue = radio.getAttribute('c-option')
          }
        })
      })
    }

    trackPrevious(switcher)
  }, [city])

  return (
    <>
      <div className="city-switcher-wrapper">
        <div className="help-bubble">
          <p>{getTranslationString('help-bubble', language, city)}</p>
        </div>
        <fieldset className="city-switcher">
          <legend className="city-switcher__legend">Choose city</legend>
          <label className="city-switcher__option">
            <input
              className="city-switcher__input"
              type="radio"
              name="city"
              value="Lisbon"
              c-option="1"
              checked={city === 'Lisbon'}
              onChange={() => setCity('Lisbon')}
            />
            <span className="city-switcher__text">Lisboa</span>
          </label>
          <label className="city-switcher__option">
            <input
              className="city-switcher__input"
              type="radio"
              name="city"
              value="Porto"
              c-option="2"
              checked={city === 'Porto'}
              onChange={() => setCity('Porto')}
            />
            <span className="city-switcher__text">Porto</span>
          </label>
        </fieldset>
      </div>
      <header>
        <Language language={language} setLanguage={setLanguage} city={city} />
        <div className="parallaxWrapper">
          <div id="layer1" className="parallaxLayer" data-speed="30"></div>
          <div id="layer2" className="parallaxLayer" data-speed="-80">
            <Image
              className="logo"
              src={logoImage}
              alt="Logo Image"
              layout="responsive"
              priority={true}
            ></Image>
            <div className="logoLegend">
              {language === 'en' ? 'by' : 'por'}{' '}
              <a
                href={language === 'en' ? 'https://joaobernardo.me/en' : 'https://joaobernardo.me'}
              >
                João Bernardo Narciso
              </a>
            </div>

            <div className="introDescription">
              {getTranslationString('subtitle', language, city)}
            </div>
            {/* Show size disclaimer on mobile devices */}
            <div className="size-disclaimer mobile-only">
              {getTranslationString('size-disclaimer', language, city)}
            </div>
            <div className={`arrow-container ${showArrow && isMapLoaded ? 'visible' : ''}`}>
              <div className="arrow"></div>
              <div className="arrow"></div>
            </div>
            <div className={`loading-message ${showArrow && !isMapLoaded ? 'visible' : ''}`}>
              {getTranslationString('loading-message', language, city)}
            </div>
          </div>

          <div id="layer3" className="parallaxLayer">
            <Image src={housesShorter} alt="City landscape image" layout="responsive"></Image>
            {plaques.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                className="al-plaque"
                src={ALPlaque.src}
                alt=""
                style={{ top: `${p.top}%`, left: `${p.left}%` }}
              />
            ))}
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
