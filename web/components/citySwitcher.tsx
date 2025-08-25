import { useEffect } from 'react'

type Props = {
  city: 'Lisbon' | 'Porto'
  setCity: (c: 'Lisbon' | 'Porto') => void
}

const CitySwitcher = ({ city, setCity }: Props) => {
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
  )
}

export default CitySwitcher
