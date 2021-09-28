import { AddIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Heading,
  Skeleton,
  Stack,
  VStack,
} from '@chakra-ui/react'
import {
  TPaginationDataPageBased,
  TPaginationResult,
} from '@premieroctet/next-crud'
import { User } from '@prisma/client'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { useInfiniteQuery } from 'react-query'
import Layout from '../../components/Layout'
import UserListItem from '../../components/users/UserListItem'

const Users = () => {
  const { push } = useRouter()
  const { data, fetchNextPage, isFetching, hasNextPage, refetch } =
    useInfiniteQuery<TPaginationResult<User>>(
      'users',
      async ({ pageParam = 1 }) => {
        const data: TPaginationResult<User> = await fetch(
          `/api/users?page=${pageParam}`
        ).then((res) => res.json())

        return data
      },
      {
        getNextPageParam: (lastPage) => {
          const pagination = lastPage.pagination as TPaginationDataPageBased
          return pagination.page === pagination.pageCount
            ? undefined
            : pagination.page + 1
        },
      }
    )

  const allData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data)
  }, [data])

  const onEditUser = (id: User['id']) => {
    push(`/users/${id}`)
  }

  const onDeleteUser = async (id: User['id']) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: 'DELETE',
    })
    refetch()
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
          {allData?.map((user) => (
            <UserListItem
              key={user.id}
              {...user}
              onEdit={onEditUser}
              onDelete={onDeleteUser}
            />
          ))}
        </VStack>
        <Button
          colorScheme="blue"
          onClick={() => fetchNextPage()}
          disabled={isFetching || !hasNextPage}
        >
          Load more
        </Button>
      </VStack>
    </Layout>
  )
}

export default Users
