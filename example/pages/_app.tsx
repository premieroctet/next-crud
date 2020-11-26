import React from 'react'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ChakraProvider resetCSS>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default App
