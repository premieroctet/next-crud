import { User, Post, ModelName } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'
import { prisma } from '../../db'

const handler = NextCrud({
  models: {
    [ModelName.User]: {
      name: 'users',
    },
  },
  adapter: new PrismaAdapter<User | Post, ModelName>({
    prismaClient: prisma,
  }),
  onRequest: (req) => {
    console.log(`request occured on URL ${req.url}`)
  },
  onSuccess: (req, res) => {
    console.log('request successful')
  },
  onError: (req, res, error) => {
    console.log('error during request', error)
  },
  pagination: {
    perPage: 2,
  },
})

export default handler
