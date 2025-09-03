import React from 'react'
import Link from 'next/link'
import translation, { getTranslationString } from '../libs/translation'

type Props = {
  language: string
  city: string
}

const Footer = ({ language, city }: Props) => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="explore-button-wrapper">
          <Link href="/explore" className="btn btn-primary">
            {getTranslationString('explore-button', language, city)}
          </Link>
        </div>
        <div className="methodology-content">
          <h3>{getTranslationString('methodology-title', language, city).toUpperCase()}</h3>
          <div
            className="methodology-text"
            dangerouslySetInnerHTML={{
              __html: getTranslationString('methodology', language, city),
            }}></div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
