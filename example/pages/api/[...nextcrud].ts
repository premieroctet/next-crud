import { User, Post, ModelName } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'
import { prisma } from '../../db'

const handler = NextCrud({
  models: {
    [ModelName.User]: {
      name: 'users'
    },
    [ModelName.Post]: {
      name: 'posts'
    }
  },
  adapter: new PrismaAdapter<User | Post, ModelName>({
    prismaClient: prisma,
    models: Object.keys(ModelName) as ModelName[],
  }),
  swagger: {
    enabled: true,
    path: '/api/docs',
    title: 'My API CRUD',
    apiUrl: process.env.API_URL as string,
    config: {
      User: {
        tag: {
          name: 'Users',
        },
      },
      Post: {
        tag: {
          name: 'Posts',
        },
      },
    },
  },
})

export default handler
