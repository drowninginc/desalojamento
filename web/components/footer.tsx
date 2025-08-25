import React from 'react'
import translation from '../libs/translation'

type Props = {
  language: string
  city: string
}

const Footer = ({ language, city }: Props) => {
  return (
    <footer className="footer">
      <div className="footer__gradient">
        <div className="explore-button-wrapper">
          <a className="btn btn-primary" href="/explore">
            {translation('explore-button', language, city)}
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
