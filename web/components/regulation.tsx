import Container from './container'
import { useMemo, forwardRef } from 'react'
import Image from 'next/image'
import { getTranslationString } from '../libs/translation'

type Props = {
  language: string
  city: string
}

type HousePoint = {
  id: number
  side: 'left' | 'right'
  text: string
}

const Regulation = forwardRef<HTMLDivElement, Props>(({ language, city }, ref) => {
  // Memoize translation strings separately to ensure stable references
  const translationStrings = useMemo(
    () => ({
      text1: getTranslationString('regulation-city-1', language, city),
      text2: getTranslationString('regulation-city-2', language, city),
      text3: getTranslationString('regulation-city-3', language, city),
      text4: getTranslationString('regulation-city-4', language, city),
      text5: getTranslationString('regulation-city-5', language, city),
      text6: getTranslationString('regulation-city-6', language, city),
    }),
    [language, city],
  )

  const points = useMemo<HousePoint[]>(
    () => [
      { id: 1, side: 'right', text: translationStrings.text1 },
      { id: 2, side: 'left', text: translationStrings.text2 },
      { id: 3, side: 'right', text: translationStrings.text3 },
      { id: 4, side: 'left', text: translationStrings.text4 },
      { id: 5, side: 'right', text: translationStrings.text5 },
      { id: 6, side: 'left', text: translationStrings.text6 },
    ],
    [translationStrings],
  )

  return (
    <div className="regulation" ref={ref}>
      <Container>
        <h1>O que fazem as outras cidades?</h1>
        <div className="regulation-stage">
          {points.map(p => (
            <div
              key={p.id}
              className={`reg-item reg-item--${p.id} ${
                p.side === 'left' ? 'is-left' : 'is-right'
              }`}>
              <div className={`reg-house reg-house--${p.id}`}>
                <Image
                  className="reg-house__img reg-house__img--blue"
                  src="/static/images/casa_azul.png"
                  alt="Casa azul"
                  width={80}
                  height={62}
                  priority={p.id === 1}
                />
                <Image
                  className="reg-house__img reg-house__img--green"
                  src="/static/images/casa_verde.png"
                  alt="Casa verde"
                  width={80}
                  height={62}
                  priority={p.id === 1}
                />
              </div>

              <div
                className={`reg-textbox reg-textbox--${p.id} glassy`}
                dangerouslySetInnerHTML={{ __html: p.text }}
              />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
})

Regulation.displayName = 'Regulation'

export default Regulation
