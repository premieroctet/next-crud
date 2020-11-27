import { AddIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Skeleton,
  Stack,
  VStack,
} from '@chakra-ui/react'
import { User } from '@prisma/client'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr'
import Layout from '../../components/Layout'
import UserListItem from '../../components/users/UserListItem'

interface IProps {
  users: User[]
}

const Users: NextPage<IProps> = ({ users }) => {
  const { push } = useRouter()
  const { data, mutate } = useSWR<User[]>('/api/users', { initialData: users })

  const onEditUser = (id: User['id']) => {
    push(`/users/${id}`)
  }

  const onDeleteUser = async (id: User['id']) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: 'DELETE',
    })
    mutate(data?.filter((user) => user.id !== id))
  }

  return (
    <Layout title="Users" backRoute="/">
      <VStack spacing={6} width="100%">
        <Heading>Users</Heading>
        <Flex direction="row" justify="flex-end" width="100%">
          <Button
            colorScheme="green"
            leftIcon={<AddIcon color="white" />}
            onClick={() => push('/users/create')}
          >
            Create user
          </Button>
        </Flex>
        <VStack
          boxShadow="0px 2px 8px #ccc"
          p={4}
          borderRadius={6}
          width="100%"
          align="flex-start"
        >
          {!data && (
            <Stack width="100%">
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          )}
          {data?.map((user) => (
            <UserListItem
              key={user.id}
              {...user}
              onEdit={onEditUser}
              onDelete={onDeleteUser}
            />
          ))}
        </VStack>
      </VStack>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<IProps> = async () => {
  const users = await fetch(`${process.env.API_URL}/users`).then((res) =>
    res.json()
  )

  return {
    props: { users },
  }
}

export default Users
