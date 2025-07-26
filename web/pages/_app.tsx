import { AppProps } from 'next/app'
import { useEffect } from 'react'
// eslint-disable-next-line import/no-unresolved
import { Analytics } from '@vercel/analytics/react'
import '../sass/_main.scss'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0)
    }

    window.onbeforeunload = handleBeforeUnload

    // Cleanup function to remove the event listener
    return () => {
      window.onbeforeunload = null
    }
  }, [])

  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
