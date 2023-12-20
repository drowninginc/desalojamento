import Head from 'next/head'

const Meta = () => {
  return (
    <Head>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="theme-color" content="#eee5e9" />
      <meta name="Desalojamento Local" content="Desalojamento Local" />
      <title>Desalojamento Local</title>
      <meta property="og:title" content="Desalojamento Local" />
      <meta
        property="og:description"
        content="Um ensaio visual sobre o Alojamento Local no Porto e em Lisboa"
      />
      <meta property="og:image" content="/thumb.jpg" />
    </Head>
  )
}
export default Meta

