import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import Container from './container'
import anuncioImage from './images/airbnb/anuncio.jpeg'
import paginaImage from './images/airbnb/descricaoPagina.png'
import outdoorImage from './images/airbnb/outdoor.png'

gsap.registerPlugin(ScrollTrigger)

const AirbnbAnimation = () => {
  const imagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (imagesRef.current) {
      gsap.fromTo(
        imagesRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.3,
          scrollTrigger: {
            trigger: imagesRef.current,
            start: 'top 90%',
            end: 'top 20%',
            toggleActions: 'play none none reverse',
            markers: true,
          },
        },
      )
    }
  }, [])

  return (
    <Container>
      <div ref={imagesRef}>
        <img src={anuncioImage} alt="Anuncio" />
        <img src={paginaImage} alt="Pagina" />
        <img src={outdoorImage} alt="Outdoor" />
      </div>
    </Container>
  )
}

export default AirbnbAnimation
