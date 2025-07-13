import Papa from 'papaparse'
import { useEffect, useState, ReactNode } from 'react'
import csvData from './strings.csv'

type TranslationData = {
  section: string
  language: string
  city: string
  string: string
}

let cachedTranslations: TranslationData[] | null = null

export default function (section: string, language: string, city: string): ReactNode {
  const [translations, setTranslations] = useState<TranslationData[]>([])

  useEffect(() => {
    if (cachedTranslations) {
      setTranslations(cachedTranslations)
    } else {
      const transformedData = csvData.map((row: string[]) => ({
        section: row[0],
        language: row[1],
        city: row[2],
        string: row[3],
      }))
      cachedTranslations = transformedData
      setTranslations(transformedData)
    }
  }, [])

  const getTranslation = (section: string, language: string, city: string): string | undefined => {
    const translation = translations.find(
      t => t.section === section && t.language === language && t.city === city,
    )
    return translation ? translation.string : undefined
  }

  const translationString = getTranslation(section, language, city)

  if (!translationString) {
    return <>Text not found</>
  }

  return <>{translationString}</>
}

export function getTranslationString(section: string, language: string, city: string): string {
  const transformedData = csvData.map((row: string[]) => ({
    section: row[0],
    language: row[1],
    city: row[2],
    string: row[3],
  }))

  const translation = transformedData.find(
    t => t.section === section && t.language === language && t.city === city,
  )
  return translation ? translation.string : 'Text not found'
}
