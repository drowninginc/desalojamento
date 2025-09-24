import { useEffect, useCallback } from 'react'

type Props = {
  city: 'Lisbon' | 'Porto'
  setCity: (c: 'Lisbon' | 'Porto') => void
}

const CitySwitcher = ({ city, setCity }: Props) => {
  const handleCityChange = useCallback(
    (newCity: 'Lisbon' | 'Porto') => {
      setCity(newCity)
    },
    [setCity],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, newCity: 'Lisbon' | 'Porto') => {
      // Prevent double-tap zoom and ensure immediate response on mobile
      e.preventDefault()
      if (city !== newCity) {
        handleCityChange(newCity)
      }
    },
    [city, handleCityChange],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent, newCity: 'Lisbon' | 'Porto') => {
      // Only handle click if not a touch device to avoid double-firing
      if (!('ontouchstart' in window)) {
        if (city !== newCity) {
          handleCityChange(newCity)
        }
      }
    },
    [city, handleCityChange],
  )

  useEffect(() => {
    const switcher = document.querySelector('.city-switcher') as HTMLElement
    if (!switcher) return

    const trackPrevious = (el: HTMLElement) => {
      const radios = el.querySelectorAll('input[type="radio"]')
      let previousValue: string | null = null

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
    <fieldset className="city-switcher">
      <legend className="city-switcher__legend">Choose city</legend>
      <label
        className="city-switcher__option"
        onTouchStart={e => handleTouchStart(e, 'Lisbon')}
        onClick={e => handleClick(e, 'Lisbon')}>
        <input
          className="city-switcher__input"
          type="radio"
          name="city"
          value="Lisbon"
          c-option="1"
          checked={city === 'Lisbon'}
          onChange={() => {}} // Controlled by touch/click handlers
          tabIndex={-1} // Remove from tab order since label handles interaction
        />
        <span className="city-switcher__text">Lisboa</span>
      </label>
      <label
        className="city-switcher__option"
        onTouchStart={e => handleTouchStart(e, 'Porto')}
        onClick={e => handleClick(e, 'Porto')}>
        <input
          className="city-switcher__input"
          type="radio"
          name="city"
          value="Porto"
          c-option="2"
          checked={city === 'Porto'}
          onChange={() => {}} // Controlled by touch/click handlers
          tabIndex={-1} // Remove from tab order since label handles interaction
        />
        <span className="city-switcher__text">Porto</span>
      </label>
    </fieldset>
  )
}

export default CitySwitcher
