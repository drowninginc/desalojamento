import Layout from '../components/layout'
import Map from '../components/map'
import Map2 from '../components/map2'
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
        {/* <Linechart language={language} /> */}
        <Map />
        <Paragraph>{translation('paragraph1', language)}</Paragraph>
        <Map2 />
        <Histogram language={language} />
      </Layout>
    </>
  )
}

export default Index
