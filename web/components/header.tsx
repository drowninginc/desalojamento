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
    const existingPlaques: { top: number; left: number; width: number; height: number }[] = []

    // Function to check if two rectangles overlap
    const isOverlapping = (
      rect1: { top: number; left: number; width: number; height: number },
      rect2: { top: number; left: number; width: number; height: number },
    ) => {
      return !(
        rect1.left + rect1.width < rect2.left ||
        rect2.left + rect2.width < rect1.left ||
        rect1.top + rect1.height < rect2.top ||
        rect2.top + rect2.height < rect1.top
      )
    }

    // Function to find a non-overlapping position
    const findValidPosition = (width: number, height: number, maxRetries = 50) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const top = Math.random() * 30 + 15 // 15% to 45%
        const left = Math.random() * 85 + 5 // 5% to 90%

        const newRect = { top, left, width, height }

        // Check if this position overlaps with any existing plaque
        const hasOverlap = existingPlaques.some(existingRect =>
          isOverlapping(newRect, existingRect),
        )

        if (!hasOverlap) {
          return { top, left }
        }
      }
      return null // No valid position found after max retries
    }

    const intervalId = setInterval(() => {
      if (layer3 && plaqueCount < 10) {
        const plaqueWidth = (50 / layer3.offsetWidth) * 100 // Convert to percentage
        const plaqueHeight = (50 / layer3.offsetHeight) * 100 // Convert to percentage

        const position = findValidPosition(plaqueWidth, plaqueHeight)

        if (position) {
          const plaqueWrapper = document.createElement('div')
          plaqueWrapper.style.position = 'absolute'
          plaqueWrapper.style.width = '50px'
          plaqueWrapper.style.height = '50px'
          plaqueWrapper.style.top = `${position.top}%`
          plaqueWrapper.style.left = `${position.left}%`
          layer3.appendChild(plaqueWrapper)

          // Store the position for future collision detection
          existingPlaques.push({
            top: position.top,
            left: position.left,
            width: plaqueWidth,
            height: plaqueHeight,
          })

          const root = createRoot(plaqueWrapper)
          root.render(<Image src={ALPlaque} alt="AL Plaque" layout="fill" objectFit="contain" />)

          plaqueCount++
        } else {
          // If no valid position found, stop trying to add more plaques
          clearInterval(intervalId)
        }
      } else {
        clearInterval(intervalId)
      }
    }, 1500)

    return () => {
      window.removeEventListener('scroll', doParallax)
      clearInterval(intervalId)
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
