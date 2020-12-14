import 'nextra-theme-docs/style.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
