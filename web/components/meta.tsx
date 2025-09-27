import Head from 'next/head'

const Meta = () => {
  return (
    <Head>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="theme-color" content="#eee5e9" />
      <meta name="desALojamento" content="desALojamento" />
      <title>desALojamento</title>

      {/* Open Graph meta tags for social sharing */}
      <meta property="og:title" content="desALojamento" />
      <meta
        property="og:description"
        content="Alguns dados e mapas sobre o Alojamento Local em Lisboa e no Porto"
      />
      <meta property="og:image" content="https://www.desalojamento.pt/thumb.jpg" />
      <meta property="og:image:width" content="2880" />
      <meta property="og:image:height" content="1436" />
      <meta property="og:image:alt" content="desALojamento - Dados sobre Alojamento Local" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="desALojamento" />
      <meta property="og:url" content="https://www.desalojamento.pt" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@joaobernarciso" />
      <meta name="twitter:creator" content="@joaobernarciso" />
      <meta name="twitter:title" content="desALojamento" />
      <meta
        name="twitter:description"
        content="Alguns dados e mapas sobre o Alojamento Local em Lisboa e no Porto"
      />
      <meta name="twitter:image" content="https://www.desalojamento.pt/thumb.jpg" />
      <meta name="twitter:image:alt" content="desALojamento - Dados sobre Alojamento Local" />
      <meta name="twitter:domain" content="www.desalojamento.pt" />
    </Head>
  )
}
export default Meta
