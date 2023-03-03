import { AppProps } from 'next/app'
// eslint-disable-next-line import/no-unresolved
import { Analytics } from '@vercel/analytics/react'
import '../sass/_main.scss'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
