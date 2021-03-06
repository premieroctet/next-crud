import { Heading, useToast, VStack } from '@chakra-ui/react'
import { User } from '@prisma/client'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { mutate } from 'swr'
import Layout from '../../components/Layout'
import UserForm, { IFormValues } from '../../components/users/UserForm'

interface IProps {
  user: User
}

const UserCreate: NextPage<IProps> = ({ user }) => {
  const toast = useToast()
  const { replace } = useRouter()

  const onSubmit = async (values: IFormValues) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      toast({
        status: 'success',
        description: 'User successfully updated',
        duration: 2000,
      })
      replace('/users')
      mutate('/api/users', undefined, true)
    } catch (e) {
      toast({
        status: 'error',
        description: 'Failed to update user',
        duration: 2000,
      })
    }
  }

  return (
    <Layout title={user.username} backRoute="/users">
      <VStack spacing={4} width="100%">
        <Heading>User edition</Heading>
        <UserForm
          initialValues={{ username: user.username }}
          onSubmit={onSubmit}
        />
      </VStack>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<IProps> = async (ctx) => {
  const user = await fetch(
    `${process.env.API_URL}/users/${ctx.query.id}`
  ).then((res) => res.json())

  return {
    props: { user },
  }
}

export default UserCreate
