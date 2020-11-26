import { Button, Heading, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'
import Layout from '../components/Layout'

const Home = () => {
  const { push } = useRouter()

  return (
    <Layout title="Home">
      <VStack spacing={6} flex={1}>
        <Heading>next-crud example</Heading>
        <VStack spacing={4} w="100%" px={7}>
          <Button isFullWidth colorScheme="blue" onClick={() => push('/users')}>
            Users
          </Button>
        </VStack>
      </VStack>
    </Layout>
  )
}

export default Home
