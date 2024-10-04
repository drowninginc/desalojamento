import Layout from '../components/layout'
import Map from '../components/map'
import Paragraph from '../components/paragraph'
import Linechart from '../components/linechart'

import { useState } from 'react'
import translation from '../libs/translation'

const Index = () => {
  const [language, setLanguage] = useState('pt')
  const city = 'Lisbon'

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
