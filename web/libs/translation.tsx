import csvData from './strings.csv'

// "section|language|city" -> string, built once at module load
const strings = new Map<string, string>(
  csvData.map(([section, language, city, string]: string[]) => [
    `${section}|${language}|${city}`,
    string,
  ]),
)

export function getTranslationString(section: string, language: string, city: string): string {
  const string = strings.get(`${section}|${language}|${city}`)
  if (string === undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation: ${section} (${language}, ${city})`)
    }
    return ''
  }
  return string
}

export default getTranslationString
