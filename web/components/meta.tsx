import Head from 'next/head'
import { useEffect } from 'react'
import { getTranslationString } from '../libs/translation'

// Social scrapers don't run JS, so shared cards always show the Portuguese defaults baked into
// the static HTML; this keeps the tab, search engines and screen readers in the reader's language.
const Meta = ({ language = 'pt' }: { language?: string }) => {
  const description = getTranslationString('subtitle', language, 'Lisbon')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <Head>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="theme-color" content="#eee5e9" />
      <meta name="description" content={description} />
      <title>desALojamento</title>

      {/* Open Graph meta tags for social sharing */}
      <meta property="og:title" content="desALojamento" />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={language === 'en' ? 'en_GB' : 'pt_PT'} />
      <meta property="og:image" content="https://www.desalojamento.pt/thumb.jpg" />
      <meta property="og:image:width" content="2880" />
      <meta property="og:image:height" content="1436" />
      <meta property="og:image:alt" content={`desALojamento - ${description}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="desALojamento" />
      <meta property="og:url" content="https://www.desalojamento.pt" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@joaobernarciso" />
      <meta name="twitter:creator" content="@joaobernarciso" />
      <meta name="twitter:title" content="desALojamento" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.desalojamento.pt/thumb.jpg" />
      <meta name="twitter:image:alt" content={`desALojamento - ${description}`} />
      <meta name="twitter:domain" content="www.desalojamento.pt" />
    </Head>
  )
}
export default Meta
