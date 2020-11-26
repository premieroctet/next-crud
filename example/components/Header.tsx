import { ChevronLeftIcon } from '@chakra-ui/icons'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import React from 'react'

interface IProps {
  backRoute?: string
  title: string
}

const Header = ({ backRoute, title }: IProps) => {
  const { push } = useRouter()

  return (
    <Box width="100%" height={16} px={6}>
      <HStack spacing={2} alignItems="center" flex={1} height="100%">
        {!!backRoute && (
          <ChevronLeftIcon
            color="blue.500"
            fontSize="2xl"
            onClick={() => push(backRoute)}
            cursor="pointer"
          />
        )}
        <Text color="blue.500" fontWeight="bold" fontSize="lg">
          {title}
        </Text>
      </HStack>
    </Box>
  )
}

export default Header
