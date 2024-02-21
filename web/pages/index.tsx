import Layout from '../components/layout'
import Map from '../components/map'
import Paragraph from '../components/paragraph'
import Histogram from '../components/histogram'
import Linechart from '../components/linechart'

import { useState } from 'react'
import translation from '../libs/translation'

const Index = () => {
  const [language, setLanguage] = useState('pt')

  return (
    <>
      <Layout language={language} setLanguage={setLanguage}>
        <Map />
        <Paragraph>{translation('paragraph1', language)}</Paragraph>
        <Histogram language={language} />
        <Linechart language={language} />
      </Layout>
    </>
  )
}

export default Index
