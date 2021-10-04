import { User, Post } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'
import { prisma } from '../../db'

const handler = NextCrud({
  adapter: new PrismaAdapter<User | Post, 'users' | 'posts'>({
    prismaClient: prisma,
  }),
  swagger: {
    enabled: true,
    path: '/api/docs',
    title: 'My API CRUD',
    apiUrl: process.env.API_URL as string,
    config: {
      users: {
        tag: {
          name: 'Users',
        },
        type: {
          name: 'User',
        },
      },
      posts: {
        tag: {
          name: 'Posts',
        },
        type: {
          name: 'User',
        },
      },
    },
  },
})

export default handler
