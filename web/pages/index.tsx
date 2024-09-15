import Layout from '../components/layout'
import Map from '../components/map'
import Paragraph from '../components/paragraph'
import Histogram from '../components/histogram'
import Linechart from '../components/linechart'
import Casas from '../components/casas'

import { useState } from 'react'
import translation from '../libs/translation'

const Index = () => {
  const [language, setLanguage] = useState('pt')
  const city = 'Porto'

  return (
    <>
      <Layout language={language} setLanguage={setLanguage} city={city}>
        <Map city={city} />
        <Paragraph>{translation('paragraph1', language, city)}</Paragraph>
      </Layout>
    </>
  )
}

export default Index
