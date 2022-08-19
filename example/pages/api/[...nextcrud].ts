import { User, Post, Prisma } from '@prisma/client'
import NextCrud, { PrismaAdapter } from '@premieroctet/next-crud'
import { prisma } from '../../db'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const nextCrudHandler = await NextCrud({
    adapter: new PrismaAdapter<User | Post, Prisma.ModelName>({
      prismaClient: prisma,
    }),
    swagger: {
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

  return nextCrudHandler(req, res)
}

export default handler
