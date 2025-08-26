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
        <div className="footer__opacity-gradient"></div>
        <div className="explore-button-wrapper">
          <a className="btn btn-primary" href="/explore">
            {translation('explore-button', language, city)}
          </a>
        </div>
        <div className="methodology-content">
          <h3>Methodology</h3>
          <p>Content about the methodology will go here.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
